import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validar contraseña en servidor también
    const hasMinLength = password.length >= 8
    const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasMinLength || !hasCase || !hasSpecial) {
      return NextResponse.json(
        { error: 'La contraseña no cumple los requisitos de seguridad' },
        { status: 400 }
      )
    }

    // Usar service role key para crear usuarios y verificar waitlist
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // =============================================
    // VERIFICAR QUE EL EMAIL ESTÁ APROBADO EN WAITLIST
    // =============================================
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'approved')
      .single()

    if (waitlistError || !waitlistEntry) {
      console.log('❌ Email not approved in waitlist:', email)
      return NextResponse.json(
        { error: 'Tu email no ha sido aprobado todavía. Completa el cuestionario y espera la aprobación.' },
        { status: 403 }
      )
    }

    console.log('✅ Email approved in waitlist:', email)

    // =============================================
    // CREAR USUARIO EN SUPABASE AUTH
    // =============================================
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since they're approved
    })

    if (error) {
      // Si el usuario ya existe
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Este email ya tiene una cuenta. Intenta iniciar sesión.' },
          { status: 400 }
        )
      }
      
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('✅ User created successfully:', email)

    // Cuenta creada - el usuario puede iniciar sesión inmediatamente
    return NextResponse.json({ 
      success: true, 
      message: 'Cuenta creada correctamente. ¡Bienvenido a Portal Culture!'
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
