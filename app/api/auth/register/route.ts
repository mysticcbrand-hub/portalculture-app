import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('📥 Register request received:', { 
      email: email ? '***@' + email.split('@')[1] : 'missing',
      hasPassword: !!password,
      bodyKeys: Object.keys(body)
    })

    // =============================================
    // 1. VALIDACIONES
    // =============================================
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar contraseña
    const hasMinLength = password.length >= 8
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasMinLength) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    if (!hasLowerCase || !hasUpperCase) {
      return NextResponse.json(
        { error: 'La contraseña debe tener mayúsculas y minúsculas' },
        { status: 400 }
      )
    }

    if (!hasSpecial) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos un carácter especial' },
        { status: 400 }
      )
    }

    // =============================================
    // 2. SETUP SUPABASE ADMIN
    // =============================================
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const normalizedEmail = email.toLowerCase().trim()

    // =============================================
    // 3. VERIFICAR SI YA EXISTE CUENTA
    // =============================================
    
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === normalizedEmail
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email. Intenta iniciar sesión.' },
        { status: 400 }
      )
    }

    // =============================================
    // 4. CREAR CUENTA CON SUPABASE SIGNUP
    // =============================================
    
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (e) {
              // Ignore in server context
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (e) {
              // Ignore in server context
            }
          },
        },
      }
    )

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.portalculture.com'}/auth/callback`
      }
    })

    if (signUpError) {
      console.error('❌ SignUp error:', signUpError.message)
      
      if (signUpError.message.includes('already') || signUpError.message.includes('exists')) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email. Intenta iniciar sesión.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!signUpData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear la cuenta. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    console.log('✅ User created, confirmation email sent:', normalizedEmail)

    // =============================================
    // 5. CREAR PROFILE CON access_status 'none'
    // =============================================
    
    if (signUpData.user) {
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          email: normalizedEmail,
          access_status: 'none',
          created_at: new Date().toISOString()
        })
    }

    // =============================================
    // 6. MAILERLITE - NO SE AÑADE AQUÍ
    // =============================================
    // MailerLite se añade SOLO cuando el usuario completa el Typeform
    // para que reciba el email de "Solicitud recibida".
    // 
    // Al crear cuenta, solo Supabase envía el email de "Confirm signup"
    
    console.log('✅ User registered successfully:', normalizedEmail)

    // =============================================
    // 7. RESPONDER
    // =============================================

    return NextResponse.json({ 
      success: true,
      needsEmailConfirmation: true,
      message: 'Revisa tu email para confirmar tu cuenta.'
    })

  } catch (error: any) {
    console.error('❌ Register error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    })
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
