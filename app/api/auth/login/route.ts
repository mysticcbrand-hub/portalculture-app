import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Login attempt for:', email)
    console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔍 API Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)

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

    console.log('🔍 Response status:', response.status)
    console.log('🔍 Response data:', response.data)

    if (response.status !== 200) {
      console.error('🔴 Login failed:', JSON.stringify(response.data))
      
      // Mensajes de error más claros
      let errorMessage = 'Error al iniciar sesión'
      if (response.data.error === 'invalid_grant') {
        errorMessage = 'Credenciales incorrectas'
      } else if (response.data.error_description) {
        errorMessage = response.data.error_description
      } else if (response.data.msg) {
        errorMessage = response.data.msg
      } else if (response.data.message) {
        errorMessage = response.data.message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
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
