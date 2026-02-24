import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname === '/'
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')
  const isSeleccionarAcceso = pathname === '/seleccionar-acceso'
  const isCuestionario = pathname === '/cuestionario'
  const isPendingPage = pathname === '/pendiente-aprobacion'
  const isResetPassword = pathname === '/reset-password'
  const isConfirmEmail = pathname === '/confirm-email'

  // CASE 1: Not logged in trying to access protected routes → redirect to login
  if (!user && (isDashboard || isAdminRoute || isSeleccionarAcceso || isCuestionario) && !isResetPassword && !isConfirmEmail) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // CASE 2: Admin routes - only mysticcbrand@gmail.com allowed
  if (user && isAdminRoute) {
    if (user.email !== 'mysticcbrand@gmail.com') {
      return NextResponse.redirect(new URL('/seleccionar-acceso', request.url))
    }
  }

  // CASE 3: Logged in user trying to access dashboard - check if approved or premium
  if (user && isDashboard) {
    // Admin always has access
    if (user.email === 'mysticcbrand@gmail.com') {
      return response
    }

    // Check user_metadata fallback first (no DB/RLS dependency)
    if (user.user_metadata?.access_status === 'paid') {
      return response
    }

    // Check user's access status first (avoid extra queries)
    const { data: profile } = await supabase
      .from('profiles')
      .select('access_status')
      .eq('id', user.id)
      .maybeSingle()

    const accessStatus = profile?.access_status || 'none'

    if (accessStatus === 'approved' || accessStatus === 'paid') {
      return response
    }

    if (accessStatus === 'pending') {
      return NextResponse.redirect(new URL('/pendiente-aprobacion', request.url))
    }

    // Fallback: check premium_users only when access_status is none
    const { data: premiumUser } = await supabase
      .from('premium_users')
      .select('payment_status, access_granted')
      .eq('user_id', user.id)
      .maybeSingle()

    if (premiumUser?.payment_status === 'active' && premiumUser?.access_granted) {
      return response
    }

    return NextResponse.redirect(new URL('/seleccionar-acceso', request.url))
  }

  // CASE 4: Logged in user on login page → redirect to appropriate page
  if (user && isAuthPage) {
    // Admin always goes to waitlist
    if (user.email === 'mysticcbrand@gmail.com') {
      return NextResponse.redirect(new URL('/admin/waitlist', request.url))
    }

    // Check user_metadata fallback first (no DB/RLS dependency)
    if (user.user_metadata?.access_status === 'paid') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check access status first
    const { data: profile } = await supabase
      .from('profiles')
      .select('access_status')
      .eq('id', user.id)
      .maybeSingle()

    const accessStatus = profile?.access_status || 'none'

    if (accessStatus === 'approved' || accessStatus === 'paid') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (accessStatus === 'pending') {
      return NextResponse.redirect(new URL('/pendiente-aprobacion', request.url))
    }

    // Fallback: check premium_users only when access_status is none
    const { data: premiumUser } = await supabase
      .from('premium_users')
      .select('payment_status, access_granted')
      .eq('user_id', user.id)
      .maybeSingle()

    if (premiumUser?.payment_status === 'active' && premiumUser?.access_granted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.redirect(new URL('/seleccionar-acceso', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
