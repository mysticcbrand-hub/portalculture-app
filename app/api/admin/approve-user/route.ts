import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // 1. Verificar que quien hace el request es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'mysticcbrand@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // 2. Obtener datos del usuario de la waitlist
    const { data: waitlistUser, error: fetchError } = await supabase
      .from('waitlist')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (fetchError || !waitlistUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 3. Actualizar status en Supabase
    const { error: updateError } = await supabase
      .from('waitlist')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (updateError) {
      throw updateError
    }

    // 4. Mover a grupo "approved" en Mailerlite
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const MAILERLITE_GROUP_APPROVED = process.env.MAILERLITE_GROUP_APPROVED
    
    console.log('🔍 Debug Mailerlite Config:', {
      hasApiKey: !!MAILERLITE_API_KEY,
      apiKeyLength: MAILERLITE_API_KEY?.length,
      hasGroupApproved: !!MAILERLITE_GROUP_APPROVED,
      groupApprovedValue: MAILERLITE_GROUP_APPROVED,
      email: waitlistUser.email
    })
    
    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_APPROVED) {
      console.error('❌ Mailerlite credentials not configured:', {
        MAILERLITE_API_KEY: !!MAILERLITE_API_KEY,
        MAILERLITE_GROUP_APPROVED: !!MAILERLITE_GROUP_APPROVED
      })
      return NextResponse.json({ 
        success: true,
        warning: 'Approved in DB but Mailerlite not configured',
        debug: {
          hasApiKey: !!MAILERLITE_API_KEY,
          hasGroupApproved: !!MAILERLITE_GROUP_APPROVED
        }
      })
    }

    // Añadir al grupo "approved" (automáticamente triggerea la automatización)
    console.log('📤 Sending to Mailerlite API...')
    
    const requestBody = {
      email: waitlistUser.email,
      fields: {
        name: waitlistUser.name || ''
      },
      groups: [MAILERLITE_GROUP_APPROVED]
    }
    
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))
    
    const mailerliteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const mailerliteData = await mailerliteResponse.json()
    
    console.log('📨 Mailerlite Response:', {
      status: mailerliteResponse.status,
      ok: mailerliteResponse.ok,
      data: mailerliteData
    })

    if (!mailerliteResponse.ok) {
      console.error('❌ Mailerlite API error:', {
        status: mailerliteResponse.status,
        statusText: mailerliteResponse.statusText,
        data: mailerliteData
      })
      return NextResponse.json({ 
        success: true,
        warning: 'Approved in DB but failed to add to Mailerlite group',
        mailerliteError: {
          status: mailerliteResponse.status,
          data: mailerliteData
        }
      })
    }

    console.log('✅ User approved and moved to Mailerlite "approved" group:', waitlistUser.email)
    
    return NextResponse.json({ 
      success: true,
      message: 'User approved successfully. Email will be sent automatically by Mailerlite.',
      debug: {
        mailerliteStatus: mailerliteResponse.status,
        subscriberAdded: true
      }
    })
    
  } catch (error: any) {
    console.error('Error approving user:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
