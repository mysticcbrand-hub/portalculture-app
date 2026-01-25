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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already has a waitlist entry
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('user_id', user_id)
      .maybeSingle()

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
        { error: 'Error al guardar la solicitud. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    console.log('✅ Waitlist entry created for user:', user_id)

    return NextResponse.json({ 
      success: true,
      message: 'Solicitud enviada correctamente'
    })

  } catch (error: any) {
    console.error('❌ Waitlist submit error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
