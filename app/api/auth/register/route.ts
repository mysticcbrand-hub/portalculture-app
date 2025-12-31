import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Usar cliente de Supabase en el servidor
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Registrar usuario
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    // Login automático después de registro
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      return NextResponse.json(
        { error: loginError.message },
        { status: 400 }
      )
    }

    // Guardar tokens en cookies
    const cookieStore = await cookies()
    
    if (loginData.session) {
      cookieStore.set('sb-access-token', loginData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: loginData.session.expires_in || 3600
      })

      cookieStore.set('sb-refresh-token', loginData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    return NextResponse.json({ success: true, user: loginData.user })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
