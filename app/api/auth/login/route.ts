import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Usar axios en lugar de fetch (no tiene problemas con headers largos)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        validateStatus: () => true // Aceptar cualquier status
      }
    )

    if (response.status !== 200) {
      return NextResponse.json(
        { error: response.data.error_description || response.data.message || 'Error al iniciar sesión' },
        { status: response.status }
      )
    }

    const data = response.data

    // Guardar tokens en cookies
    const cookieStore = await cookies()
    
    if (data.access_token) {
      cookieStore.set('sb-access-token', data.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expires_in || 3600
      })
    }

    if (data.refresh_token) {
      cookieStore.set('sb-refresh-token', data.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
