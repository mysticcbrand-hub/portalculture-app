import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  // Simply redirect to dashboard
  // Supabase client handles the session automatically
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
