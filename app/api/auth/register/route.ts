import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const cookieStore = await cookies()

    // Usar cliente SSR de Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
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

    // Las cookies ya se guardan automáticamente con @supabase/ssr
    return NextResponse.json({ success: true, user: loginData.user })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
