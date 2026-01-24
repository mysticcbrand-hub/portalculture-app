import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Login attempt for:', email)

    const cookieStore = await cookies()

    // Create Supabase server client with proper cookie handling
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
              // Ignore errors in server components
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (e) {
              // Ignore errors in server components
            }
          },
        },
      }
    )

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login failed:', error.message)
      
      // Clear error messages
      let errorMessage = 'Error al iniciar sesión'
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email no confirmado'
      } else {
        errorMessage = error.message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    console.log('✅ Login successful for:', email)

    return NextResponse.json({ 
      success: true, 
      user: data.user 
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
