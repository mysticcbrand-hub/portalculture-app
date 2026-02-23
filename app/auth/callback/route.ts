import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'email' | 'recovery' | null
  const next = searchParams.get('next') ?? '/dashboard'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://app.portalculture.com'
  const redirectTo = `${appUrl}${next}`
  const errorUrl = `${appUrl}/auth/auth-code-error`

  const supabase = await createClient()

  // Caso 1: Magic link o email OTP via token_hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
    console.error('❌ verifyOtp error:', error.message)
    return NextResponse.redirect(errorUrl)
  }

  // Caso 2: OAuth / email confirmation via code (PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
    console.error('❌ exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(errorUrl)
  }

  return NextResponse.redirect(errorUrl)
}
