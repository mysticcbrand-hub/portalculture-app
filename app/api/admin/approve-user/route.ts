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
    
    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_APPROVED) {
      console.error('Mailerlite credentials not configured')
      return NextResponse.json({ 
        success: true,
        warning: 'Approved in DB but Mailerlite not configured' 
      })
    }

    // Añadir al grupo "approved" (automáticamente triggerea la automatización)
    const mailerliteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: waitlistUser.email,
        fields: {
          name: waitlistUser.name || ''
        },
        groups: [MAILERLITE_GROUP_APPROVED]
      })
    })

    const mailerliteData = await mailerliteResponse.json()

    if (!mailerliteResponse.ok) {
      console.error('Mailerlite API error:', mailerliteData)
      return NextResponse.json({ 
        success: true,
        warning: 'Approved in DB but failed to add to Mailerlite group',
        mailerliteError: mailerliteData
      })
    }

    console.log('✅ User approved and moved to Mailerlite "approved" group:', waitlistUser.email)
    
    return NextResponse.json({ 
      success: true,
      message: 'User approved successfully. Email will be sent automatically by Mailerlite.'
    })
    
  } catch (error: any) {
    console.error('Error approving user:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
