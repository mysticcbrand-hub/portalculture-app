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

    // Usar service role key para crear usuarios
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Registrar usuario con email de confirmación
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://app-portalculture.vercel.app'}/auth/callback`,
      }
    })

    if (error) {
      // Manejar errores comunes
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este correo ya está registrado' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // No hacemos login automático - el usuario debe verificar su correo primero
    return NextResponse.json({ 
      success: true, 
      message: 'Cuenta creada. Revisa tu correo para verificar.',
      requiresVerification: true
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
