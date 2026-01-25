import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { name, email, phone, metadata } = await request.json()

    // Validations
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nombre, email y teléfono son requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists in waitlist
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      // User already submitted
      if (existing.status === 'approved') {
        return NextResponse.json(
          { error: 'Ya has sido aprobado. Puedes crear tu cuenta en la página principal.' },
          { status: 400 }
        )
      } else if (existing.status === 'registered') {
        return NextResponse.json(
          { error: 'Ya tienes una cuenta. Inicia sesión en la página principal.' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: 'Ya has enviado una solicitud. Revisaremos tu perfil pronto.' },
          { status: 400 }
        )
      }
    }

    // Insert new waitlist entry
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        status: 'pending',
        metadata: metadata || {},
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Waitlist insert error:', error)
      return NextResponse.json(
        { error: 'Error al guardar la solicitud. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    console.log('✅ Waitlist entry created:', normalizedEmail)

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
