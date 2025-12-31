import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Registro directo con Supabase REST API
    const response = await fetch(
      `${supabaseUrl}/auth/v1/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`
        },
        body: JSON.stringify({ email, password })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error_description || data.message || 'Error al crear cuenta' },
        { status: response.status }
      )
    }

    // Login automático después de registro
    const loginResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`
        },
        body: JSON.stringify({ email, password })
      }
    )

    const loginData = await loginResponse.json()

    if (loginResponse.ok) {
      // Guardar tokens en cookies
      const cookieStore = await cookies()
      
      cookieStore.set('sb-access-token', loginData.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: loginData.expires_in
      })

      cookieStore.set('sb-refresh-token', loginData.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
