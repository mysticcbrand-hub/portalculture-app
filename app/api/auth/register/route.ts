import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

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
    // 4. CREAR CUENTA CON ADMIN (EMAIL AUTO-CONFIRMADO)
    // =============================================
    
    // Usar admin.createUser para evitar problemas con email confirmation
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        created_via: 'registration_form'
      }
    })

    if (signUpError) {
      console.error('❌ CreateUser error:', signUpError.message)
      
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

    console.log('✅ User created with admin:', normalizedEmail)

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
    // 6. AÑADIR A MAILERLITE (GRUPO PORTAL CULTURE)
    // =============================================
    
    try {
      const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
      const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID

      if (MAILERLITE_API_KEY && MAILERLITE_GROUP_ID) {
        const mailerliteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: normalizedEmail,
            groups: [MAILERLITE_GROUP_ID],
            status: 'active'
          })
        })

        if (mailerliteResponse.ok) {
          console.log('✅ User added to Mailerlite group:', normalizedEmail)
        } else {
          const mlError = await mailerliteResponse.json()
          console.warn('⚠️ Mailerlite warning:', mlError.message || 'Could not add to mailing list')
        }
      }
    } catch (mlError) {
      // No bloqueamos el registro si falla Mailerlite
      console.warn('⚠️ Mailerlite error (non-blocking):', mlError)
    }

    console.log('✅ User registered successfully:', normalizedEmail)

    // =============================================
    // 7. RESPONDER
    // =============================================

    return NextResponse.json({ 
      success: true,
      needsEmailConfirmation: false,
      message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.'
    })

  } catch (error: any) {
    console.error('❌ Register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
