import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { user_id, name, email, phone, metadata } = await request.json()

    // Validations
    if (!user_id || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already has a waitlist entry (by email)
    const { data: existing, error: existingError } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingError) {
      console.error('❌ Waitlist lookup error:', existingError)
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Ya has enviado una solicitud. Revisaremos tu perfil pronto.' },
        { status: 400 }
      )
    }

    // Build insert object - only include fields that exist
    const insertData: Record<string, any> = {
      name: name.trim(),
      email: normalizedEmail,
      status: 'pending',
      metadata: metadata || {},
      submitted_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (user_id) insertData.user_id = user_id
    if (phone) insertData.phone = phone.trim()

    // Insert new waitlist entry
    const { data, error } = await supabase
      .from('waitlist')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Waitlist insert error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      return NextResponse.json(
        { 
          error: 'Error al guardar la solicitud. Intenta de nuevo.',
          detail: error.message || error.details || 'Unknown error',
          code: error.code || null,
        },
        { status: 500 }
      )
    }

    console.log('✅ Waitlist entry created for user:', user_id)

    // Añadir a Mailerlite grupo "pending"
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID // Este es el grupo "pending"
    
    if (MAILERLITE_API_KEY && MAILERLITE_GROUP_ID) {
      try {
        const mailerliteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: normalizedEmail,
            fields: {
              name: name.trim()
            },
            groups: [MAILERLITE_GROUP_ID]
          })
        })

        const mailerliteData = await mailerliteResponse.json()

        if (!mailerliteResponse.ok) {
          console.error('⚠️ Mailerlite API error:', mailerliteData)
          // No fallar la request por esto, solo loggear
        } else {
          console.log('✅ User added to Mailerlite "pending" group:', normalizedEmail)
        }
      } catch (mailerliteError: any) {
        console.error('⚠️ Error adding to Mailerlite:', mailerliteError)
        // No fallar la request por esto
      }
    } else {
      console.warn('⚠️ Mailerlite credentials not configured')
    }

    return NextResponse.json({ 
      success: true,
      message: 'Solicitud enviada correctamente'
    })

  } catch (error: any) {
    console.error('❌ Waitlist submit error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        detail: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
