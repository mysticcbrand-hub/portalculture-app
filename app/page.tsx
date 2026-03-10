'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function PremiumLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
          <div className="absolute inset-2 w-8 h-8 rounded-full border border-transparent border-t-white/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-white/40 text-sm font-light tracking-wide">Cargando...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<PremiumLoader />}>
      <HomePageContent />
    </Suspense>
  )
}

function HomePageContent() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [isApprovedInvite, setIsApprovedInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [oauthLoading, setOauthLoading] = useState<'google' | 'discord' | null>(null)
  const [mouseGlow, setMouseGlow] = useState({ x: 50, y: 50 })
  const [introMouseGlow, setIntroMouseGlow] = useState({ x: 50, y: 50 })
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const [isHoveringIntro, setIsHoveringIntro] = useState(false)
  const [contentVisible, setContentVisible] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [cardHeight, setCardHeight] = useState<number | 'auto'>('auto')
  const [showAuth, setShowAuth] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMouseGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }, [])

  const handleIntroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const intro = introRef.current
    if (!intro) return
    const rect = intro.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setIntroMouseGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }, [])

  const handleCardMouseLeave = useCallback(() => {
    setIsHoveringCard(false)
    setMouseGlow({ x: 50, y: 50 })
  }, [])

  const handleIntroMouseLeave = useCallback(() => {
    setIsHoveringIntro(false)
    setIntroMouseGlow({ x: 50, y: 50 })
  }, [])

  const switchMode = useCallback((newMode: 'login' | 'register') => {
    if (animating || mode === newMode) return
    setAnimating(true)
    setError(null)
    setPassword('')
    setConfirmPassword('')

    const currentH = contentRef.current?.offsetHeight ?? 0
    setCardHeight(currentH)
    setContentVisible(false)

    setTimeout(() => {
      setMode(newMode)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newH = contentRef.current?.offsetHeight ?? 0
          setCardHeight(newH)
          setTimeout(() => {
            setContentVisible(true)
            setTimeout(() => {
              setCardHeight('auto')
              setAnimating(false)
            }, 550)
          }, 200)
        })
      })
    }, 180)
  }, [animating, mode])

  useEffect(() => {
    const checkSessionAndInvite = async () => {
      const inviteEmail = searchParams.get('email')
      const approved = searchParams.get('approved')
      
      if (inviteEmail && approved === 'true') {
        setEmail(decodeURIComponent(inviteEmail))
        setMode('register')
        setIsApprovedInvite(true)
        setCheckingSession(false)
        setShowAuth(true)
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          if (user.email === 'mysticcbrand@gmail.com') {
            router.replace('/admin/waitlist')
          } else {
            router.replace('/dashboard')
          }
        } else {
          setCheckingSession(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        setCheckingSession(false)
      }
    }

    checkSessionAndInvite()
  }, [router, supabase.auth, searchParams])

  const passwordRequirements = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const isPasswordValid = passwordRequirements.length && passwordRequirements.case && passwordRequirements.special
  const passwordsMatch = password === confirmPassword

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      showToast('¡Bienvenido de nuevo!', 'success')
      
      setTimeout(() => {
        if (email === 'mysticcbrand@gmail.com') {
          window.location.href = '/admin/waitlist'
        } else {
          window.location.href = '/dashboard'
        }
      }, 300)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isPasswordValid) {
      setError('La contraseña no cumple los requisitos')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Register failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          data
        })
        throw new Error(data.error || 'Error al crear la cuenta')
      }

      showToast('✅ Cuenta creada exitosamente. Revisa tu email para confirmar.', 'success')

      setTimeout(() => {
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setAcceptedTerms(false)
      }, 500)
    } catch (err: any) {
      console.error('❌ Register error caught:', err)
      setError(err.message || 'Error desconocido al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el correo')
      }

      showToast('Te hemos enviado un correo para restablecer tu contraseña', 'success')
      setShowForgotPassword(false)
      setForgotEmail('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setError(null)
    setOauthLoading(provider)

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.portalculture.com'
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
      setOauthLoading(null)
    }
  }

  const scrollToAuth = () => {
    setShowAuth(true)
    setTimeout(() => {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  if (checkingSession) {
    return <PremiumLoader />
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden" style={{ background: '#000' }}>
      {/* ── Enhanced Deband Background for Large Screens ── */}
      <div className="fixed inset-0 pointer-events-none hidden lg:block" style={{
        background: `
          radial-gradient(ellipse 140% 100% at 0% 0%, rgba(100,120,180,0.18) 0%, rgba(60,80,140,0.07) 40%, transparent 70%),
          radial-gradient(ellipse 120% 100% at 100% 0%, rgba(80,100,160,0.14) 0%, rgba(50,70,130,0.05) 40%, transparent 70%),
          radial-gradient(ellipse 100% 80% at 50% 100%, rgba(60,90,140,0.08) 0%, rgba(40,70,120,0.03) 40%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 50% 50%, rgba(80,100,160,0.05) 0%, transparent 50%)
        `
      }} />
      
      {/* Medium screens */}
      <div className="fixed inset-0 pointer-events-none hidden md:block lg:hidden" style={{
        background: `
          radial-gradient(ellipse 130% 90% at 10% 10%, rgba(100,120,180,0.15) 0%, rgba(60,80,140,0.05) 40%, transparent 70%),
          radial-gradient(ellipse 110% 80% at 90% 80%, rgba(60,90,150,0.12) 0%, rgba(40,70,130,0.04) 40%, transparent 70%),
          radial-gradient(ellipse 70% 50% at 50% 100%, rgba(80,110,160,0.06) 0%, transparent 50%)
        `
      }} />
      
      {/* Mobile */}
      <div className="fixed inset-0 pointer-events-none md:hidden" style={{
        background: `
          radial-gradient(ellipse 120% 80% at 50% 10%, rgba(100,120,180,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 100% 70% at 50% 90%, rgba(60,90,150,0.09) 0%, transparent 50%)
        `
      }} />

      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
        opacity: 0.018,
        mixBlendMode: 'overlay',
      }} />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)`
      }} />

      {/* Toast */}
      {toast && (
        <div 
          className={`
            fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50
            px-4 sm:px-5 py-3.5 rounded-2xl
            backdrop-blur-2xl border
            shadow-2xl shadow-black/20
            animate-fade-in-down
            ${toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
            }
          `}
        >
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className="text-white/90">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[420px] pt-8 sm:pt-12 pb-8 px-4">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-block">
            <div className="absolute -inset-10 bg-white/6 blur-3xl rounded-full opacity-60" />
            <h1 className="relative text-2.5 sm:text-3.5 font-bold tracking-tight animate-word-drop"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 40%, #ffffff 60%, rgba(255,255,255,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              PORTAL CULTURE
            </h1>
          </div>
          <p className="text-white/35 text-xs sm:text-sm mt-2 tracking-[0.25em] uppercase font-light animate-fade-rise" style={{ animationDelay: '0.15s' }}>Desbloquea tu potencial</p>
        </div>

        {/* ── INTRO CARD ── */}
        {!showAuth && (
          <div
            ref={introRef}
            onMouseMove={handleIntroMouseMove}
            onMouseEnter={() => setIsHoveringIntro(true)}
            onMouseLeave={handleIntroMouseLeave}
            className="relative mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {/* Ambient glow — neutral silver */}
            <div className="absolute -inset-6 rounded-[36px] pointer-events-none transition-opacity duration-700"
              style={{
                background: `radial-gradient(ellipse 130% 120% at ${introMouseGlow.x}% ${introMouseGlow.y}%, rgba(200,210,230,0.12) 0%, rgba(160,170,195,0.06) 50%, transparent 80%)`,
                filter: 'blur(28px)',
                opacity: isHoveringIntro ? 1 : 0.3,
              }}
            />
            
            {/* Gradient border — chiseled glass, directional light */}
            <div className="absolute -inset-[1.5px] rounded-[28px] pointer-events-none"
              style={{
                background: `linear-gradient(155deg, rgba(255,255,255,${isHoveringIntro ? 0.28 : 0.16}) 0%, rgba(200,210,230,${isHoveringIntro ? 0.18 : 0.10}) 35%, rgba(160,170,195,${isHoveringIntro ? 0.10 : 0.06}) 65%, rgba(255,255,255,0.04) 100%)`,
                borderRadius: '26px',
              }}
            />

            {/* Card */}
            <div className="relative rounded-[26px] p-6 sm:p-8 overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, rgba(38,38,46,0.92) 0%, rgba(28,28,34,0.95) 40%, rgba(20,20,26,0.97) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.10), inset 1px 0 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Mouse spotlight — neutral white */}
              <div className="absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle 280px at ${introMouseGlow.x}% ${introMouseGlow.y}%, rgba(200,210,230,0.08) 0%, rgba(180,190,210,0.03) 50%, transparent 70%)`,
                  opacity: isHoveringIntro ? 1 : 0,
                }}
              />

              {/* Top shimmer — silver */}
              <div className="absolute top-0 left-6 right-6 h-[1px] pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(200,210,230,0.35), rgba(255,255,255,0.25), rgba(200,210,230,0.35), transparent)' }}
              />

              {/* Content */}
              <div className="relative text-center space-y-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border shadow-lg animate-word-drop"
                  style={{
                    animationDelay: '0.2s',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(200,210,230,0.04) 100%)',
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <svg className="w-7 h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white animate-word-drop" style={{ animationDelay: '0.35s' }}>
                    Todo lo que necesitas. En un solo lugar.
                  </h2>
                  <p className="text-white/45 text-sm leading-relaxed animate-fade-rise" style={{ animationDelay: '0.5s' }}>
                    Acceso completo a un ecosistema valorado en más de <span className="text-white/80 font-semibold">590€</span> — a un precio que no te creerás.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {[
                    { icon: '🚀', text: 'Comunidad de jóvenes ambiciosos', value: 'Invalorable' },
                    { icon: '🏛️', text: '5 Templos de saber', value: '297€' },
                    { icon: '🤖', text: 'NOVA AI Coach', value: '97€' },
                    { icon: '💎', text: 'Contenido extra exclusivo', value: '+197€' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-300 hover:bg-white/[0.04] animate-fade-rise"
                      style={{
                        animationDelay: `${0.6 + i * 0.08}s`,
                        background: 'rgba(255,255,255,0.025)',
                        border: '0.5px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{feature.icon}</span>
                        <span className="text-white/65 text-sm">{feature.text}</span>
                      </div>
                      <span className="text-white/50 text-xs font-medium">{feature.value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button — Premium neutral glass */}
                <button
                  onClick={scrollToAuth}
                  className="relative w-full py-5 mt-4 rounded-2xl overflow-hidden group/btn transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer animate-fade-rise"
                  style={{
                    animationDelay: '0.92s',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 100%)',
                    backdropFilter: 'blur(32px) saturate(180%) brightness(0.95)',
                    WebkitBackdropFilter: 'blur(32px) saturate(180%) brightness(0.95)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <span className="relative z-10 flex flex-col items-center justify-center gap-1.5">
                    <span 
                      className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium"
                    >
                      Acceso completo · 17€
                    </span>
                    <span className="text-base font-bold text-white flex items-center gap-2">
                      Comenzar ahora
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent opacity-60" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AUTH SECTION ── */}
        <div 
          id="auth-section"
          className={`transition-all duration-700 ${showAuth ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}
        >
          {/* Forgot Password Card */}
          {showForgotPassword ? (
            <div
              className="relative animate-scale-in"
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setIsHoveringCard(true)}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Ambient glow */}
              <div className="absolute -inset-5 rounded-[34px] pointer-events-none transition-opacity duration-700"
                style={{
                  background: `radial-gradient(ellipse 130% 120% at ${mouseGlow.x}% ${mouseGlow.y}%, rgba(200,210,230,0.10) 0%, rgba(160,170,195,0.05) 50%, transparent 70%)`,
                  filter: 'blur(26px)',
                  opacity: isHoveringCard ? 1 : 0.3,
                }}
              />
              {/* Gradient border */}
              <div className="absolute -inset-[1.5px] rounded-3xl pointer-events-none"
                style={{
                  background: `linear-gradient(155deg, rgba(255,255,255,${isHoveringCard ? 0.24 : 0.14}), rgba(200,210,230,${isHoveringCard ? 0.14 : 0.08}), rgba(255,255,255,0.04))`,
                  borderRadius: '26px',
                }}
              />
              
              {/* Card */}
              <div className="relative rounded-[26px] p-6 sm:p-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(165deg, rgba(38,38,46,0.96) 0%, rgba(28,28,34,0.98) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 36px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <div className="absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle 240px at ${mouseGlow.x}% ${mouseGlow.y}%, rgba(200,210,230,0.07) 0%, transparent 70%)`,
                    opacity: isHoveringCard ? 1 : 0,
                  }}
                />
                <div className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(200,210,230,0.30), rgba(255,255,255,0.20), transparent)' }}
                />

                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="relative text-white/45 hover:text-white/80 mb-6 text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-x-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver
                </button>

                <h2 className="relative text-xl font-semibold text-white mb-2">Restablecer contraseña</h2>
                <p className="relative text-sm text-white/45 mb-8">Te enviaremos un enlace para restablecer tu contraseña</p>

                <form onSubmit={handleForgotPassword} className="relative space-y-5">
                  <div className="relative group/input">
                    <label className="block text-white/55 text-xs font-medium mb-2.5 ml-1 tracking-wide">Email de recuperación</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-white/[0.08] border border-white/[0.12] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        placeholder="tu@email.com"
                        required
                      />
                      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.18), transparent)' }} />
                      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-4 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_55px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="relative z-10">{loading ? 'Enviando...' : 'Enviar enlace'}</span>
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Main Auth Card */
            <div
              ref={cardRef}
              className="relative animate-scale-in"
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setIsHoveringCard(true)}
              onMouseLeave={handleCardMouseLeave}
              style={{ willChange: 'auto' }}
            >
              {/* Ambient glow exterior */}
              <div className="absolute -inset-5 rounded-[34px] pointer-events-none transition-opacity duration-700"
                style={{
                  background: `radial-gradient(ellipse 130% 120% at ${mouseGlow.x}% ${mouseGlow.y}%, rgba(200,210,230,0.10) 0%, rgba(160,170,195,0.05) 50%, transparent 70%)`,
                  filter: 'blur(26px)',
                  opacity: isHoveringCard ? 1 : 0.3,
                }}
              />

              {/* Gradient border */}
              <div className="absolute -inset-[1.5px] rounded-3xl pointer-events-none"
                style={{
                  background: `linear-gradient(155deg, rgba(255,255,255,${isHoveringCard ? 0.24 : 0.14}), rgba(200,210,230,${isHoveringCard ? 0.14 : 0.08}), rgba(255,255,255,0.04))`,
                  borderRadius: '26px',
                }}
              />

              {/* Card */}
              <div
                style={{
                  background: 'linear-gradient(165deg, rgba(38,38,46,0.96) 0%, rgba(28,28,34,0.98) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: `0 36px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)`,
                  height: cardHeight === 'auto' ? 'auto' : `${cardHeight}px`,
                  overflow: 'hidden',
                  transition: 'height 0.5s cubic-bezier(0.34,1.26,0.64,1)',
                  borderRadius: '1.625rem',
                }}
              >
                <div
                  ref={contentRef}
                  className="p-6 sm:p-8"
                  style={{
                    opacity: contentVisible ? 1 : 0,
                    transform: contentVisible ? 'translateY(0)' : 'translateY(6px)',
                    transition: contentVisible
                      ? 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)'
                      : 'opacity 0.15s ease, transform 0.15s ease',
                  }}
                >
                  {/* Mouse spotlight */}
                  <div className="absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle 240px at ${mouseGlow.x}% ${mouseGlow.y}%, rgba(200,210,230,0.07) 0%, transparent 70%)`,
                      opacity: isHoveringCard ? 1 : 0,
                    }}
                  />
                  {/* Shimmer top */}
                  <div className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(200,210,230,0.30), rgba(255,255,255,0.20), transparent)' }}
                  />
                  
                  {/* Mode toggle pills */}
                  <div className="relative flex p-1 mb-6 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
                    {['login', 'register'].map((m) => (
                      <button
                        key={m}
                        onClick={() => switchMode(m as 'login' | 'register')}
                        disabled={animating}
                        className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                          mode === m 
                            ? 'bg-white text-black shadow-lg shadow-black/10' 
                            : 'text-white/45 hover:text-white/70'
                        }`}
                      >
                        {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                      </button>
                    ))}
                  </div>

                  {/* Login Form */}
                  {mode === 'login' && (
                    <form onSubmit={handleLogin} className="relative space-y-5">
                      {/* Email Input */}
                      <div className="relative group/input">
                        <label className="block text-white/55 text-xs font-medium mb-2.5 ml-1 tracking-wide">Correo electrónico</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-white/[0.08] border border-white/[0.12] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-500 ease-premium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            placeholder="tu@email.com"
                            required
                          />
                          <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.18), transparent)' }} />
                          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="relative group/input">
                        <label className="block text-white/55 text-xs font-medium mb-2.5 ml-1 tracking-wide">Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 pr-14 bg-white/[0.08] border border-white/[0.12] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-500 ease-premium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75 transition-colors"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.477 10.482a3 3 0 004.242 4.243M9.88 9.88A3 3 0 0114.12 14.12M6.228 6.228C4.227 7.634 2.808 9.43 2 12c1.73 5.523 7.0 9 10 9 1.545 0 3.006-.37 4.3-1.03M9.172 4.172A9.987 9.987 0 0112 4c3 0 8.27 3.477 10 9a14.95 14.95 0 01-1.548 2.91" />
                              </svg>
                            )}
                          </button>
                          <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.18), transparent)' }} />
                          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-red-500/[0.12] border border-red-500/25 rounded-2xl">
                          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-red-400 text-xs">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full py-4 mt-2 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_55px_rgba(147,197,253,0.45),0_0_90px_rgba(96,165,250,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Iniciando sesión...
                            </>
                          ) : 'Iniciar sesión'}
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                      </button>

                      <div className="relative flex items-center gap-3 py-2">
                        <div className="h-px flex-1 bg-white/[0.08]" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">o</span>
                        <div className="h-px flex-1 bg-white/[0.08]" />
                      </div>

                      <div className="grid gap-3">
                        {/* Google */}
                        <button
                          type="button"
                          onClick={() => handleOAuthLogin('google')}
                          disabled={oauthLoading !== null}
                          className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-white/[0.18] bg-gradient-to-br from-white/[0.12] to-white/[0.05] text-white text-sm font-semibold transition-all duration-300 hover:border-white/35 hover:from-white/[0.18] hover:to-white/[0.08] hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(255,255,255,0.12)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 overflow-hidden"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-lg">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </div>
                          <span className="flex-1 text-center">
                            {oauthLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}
                          </span>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 pointer-events-none" />
                        </button>

                        {/* Discord */}
                        <button
                          type="button"
                          onClick={() => handleOAuthLogin('discord')}
                          disabled={oauthLoading !== null}
                          className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-[#5865F2]/40 bg-gradient-to-br from-[#5865F2]/[0.22] to-[#5865F2]/[0.10] text-white text-sm font-semibold transition-all duration-300 hover:border-[#5865F2]/60 hover:from-[#5865F2]/[0.30] hover:to-[#5865F2]/[0.15] hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(88,101,242,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 overflow-hidden"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#5865F2] shadow-lg">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                          </div>
                          <span className="flex-1 text-center">
                            {oauthLoading === 'discord' ? 'Conectando...' : 'Continuar con Discord'}
                          </span>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 pointer-events-none" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="w-full text-center text-xs text-white/35 hover:text-white/65 transition-all duration-300 cursor-pointer py-2"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </form>
                  )}

                  {/* Register Form */}
                  {mode === 'register' && (
                    <form onSubmit={handleRegister} className="relative space-y-5">
                      {/* Email */}
                      <div className="relative group/input">
                        <label className="block text-white/55 text-xs font-medium mb-2.5 ml-1">Correo electrónico</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-4 bg-white/[0.08] border border-white/[0.12] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-500"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="relative group/input">
                        <label className="block text-white/55 text-xs font-medium mb-2.5 ml-1">Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 pr-14 bg-white/[0.08] border border-white/[0.12] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-500"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75 transition-colors"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.477 10.482a3 3 0 004.242 4.243M9.88 9.88A3 3 0 0114.12 14.12M6.228 6.228C4.227 7.634 2.808 9.43 2 12c1.73 5.523 7.0 9 10 9 1.545 0 3.006-.37 4.3-1.03M9.172 4.172A9.987 9.987 0 0112 4c3 0 8.27 3.477 10 9a14.95 14.95 0 01-1.548 2.91" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        <div className="mt-4 p-4 bg-white/[0.04] rounded-2xl border border-white/[0.06] space-y-3">
                          <p className="text-white/35 text-[10px] uppercase tracking-wider font-medium mb-2">Requisitos</p>
                          {[
                            { key: 'length', label: 'Mínimo 8 caracteres' },
                            { key: 'case', label: '1 mayúscula y 1 minúscula' },
                            { key: 'special', label: '1 carácter especial (!@#$%...)' },
                          ].map(({ key, label }) => (
                            <div key={key} className={`flex items-center gap-3 text-xs transition-all duration-500 ${passwordRequirements[key as keyof typeof passwordRequirements] ? 'text-emerald-400' : 'text-white/30'}`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${passwordRequirements[key as keyof typeof passwordRequirements] ? 'bg-emerald-500/25' : 'bg-white/[0.06]'}`}>
                                {passwordRequirements[key as keyof typeof passwordRequirements] ? (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                )}
                              </div>
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="relative group/input">
                        <label className="block text-white/55 text-xs font-medium mb-2.5 ml-1">Repetir contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-5 py-4 pr-14 bg-white/[0.08] border rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/[0.12] transition-all duration-500 ${
                              confirmPassword && !passwordsMatch ? 'border-red-500/40 focus:border-red-500/60' : 'border-white/[0.12] focus:border-purple-500/50'
                            }`}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75 transition-colors"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.477 10.482a3 3 0 004.242 4.243M9.88 9.88A3 3 0 0114.12 14.12M6.228 6.228C4.227 7.634 2.808 9.43 2 12c1.73 5.523 7.0 9 10 9 1.545 0 3.006-.37 4.3-1.03M9.172 4.172A9.987 9.987 0 0112 4c3 0 8.27 3.477 10 9a14.95 14.95 0 01-1.548 2.91" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {confirmPassword && (
                          <div className={`flex items-center gap-2 mt-2.5 ml-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {passwordsMatch ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            <p className="text-xs">{passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</p>
                          </div>
                        )}
                      </div>

                      {/* Terms */}
                      <label className="flex items-start gap-4 cursor-pointer group/check p-4 bg-white/[0.04] rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                            acceptedTerms 
                              ? 'bg-white border-white' 
                              : 'bg-transparent border-white/25 group-hover/check:border-white/45'
                          }`}>
                            {acceptedTerms && (
                              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-white/45 leading-relaxed group-hover/check:text-white/65 transition-colors">
                          Acepto los{' '}
                          <a href="/terminos" className="text-white/75 underline decoration-white/25 hover:text-white hover:decoration-white/50 transition-all">términos de uso</a>
                          {' '}y las{' '}
                          <a href="/privacidad" className="text-white/75 underline decoration-white/25 hover:text-white hover:decoration-white/50 transition-all">políticas del club</a>
                        </span>
                      </label>

                      {error && (
                        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-red-500/[0.12] border border-red-500/25 rounded-2xl">
                          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-red-400 text-xs">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !isPasswordValid || !passwordsMatch || !acceptedTerms}
                        className="relative w-full py-4 mt-2 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed hover:shadow-[0_0_55px_rgba(255,255,255,0.25)] active:scale-[0.98]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Creando cuenta...
                            </>
                          ) : 'Crear cuenta'}
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </button>

                      <div className="relative flex items-center gap-3 py-2">
                        <div className="h-px flex-1 bg-white/[0.08]" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">o</span>
                        <div className="h-px flex-1 bg-white/[0.08]" />
                      </div>

                      <div className="grid gap-3">
                        <button
                          type="button"
                          onClick={() => handleOAuthLogin('google')}
                          disabled={oauthLoading !== null}
                          className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-white/[0.18] bg-gradient-to-br from-white/[0.12] to-white/[0.05] text-white text-sm font-semibold transition-all duration-300 hover:border-white/35 hover:from-white/[0.18] hover:to-white/[0.08] hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(255,255,255,0.12)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 overflow-hidden"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-lg">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </div>
                          <span className="flex-1 text-center">
                            {oauthLoading === 'google' ? 'Conectando...' : 'Registrarse con Google'}
                          </span>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 pointer-events-none" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOAuthLogin('discord')}
                          disabled={oauthLoading !== null}
                          className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-[#5865F2]/40 bg-gradient-to-br from-[#5865F2]/[0.22] to-[#5865F2]/[0.10] text-white text-sm font-semibold transition-all duration-300 hover:border-[#5865F2]/60 hover:from-[#5865F2]/[0.30] hover:to-[#5865F2]/[0.15] hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(88,101,242,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 overflow-hidden"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#5865F2] shadow-lg">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                          </div>
                          <span className="flex-1 text-center">
                            {oauthLoading === 'discord' ? 'Conectando...' : 'Registrarse con Discord'}
                          </span>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 pointer-events-none" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Toggle mode */}
                  <div className="relative mt-8 pt-6 border-t border-white/[0.06] text-center">
                    <p className="text-sm text-white/35">
                      {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
                      <button
                        onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                        className="ml-2 text-white/75 hover:text-white transition-all duration-300 cursor-pointer font-medium hover:underline underline-offset-4 decoration-white/30"
                        disabled={animating}
                      >
                        {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 space-y-3">
          <div className="flex items-center justify-center gap-6 text-white/25">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Seguro</span>
            </div>
            <div className="w-px h-3 bg-white/12" />
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Privado</span>
            </div>
          </div>
          <p className="text-[10px] text-white/18 tracking-wider">
            © 2026 Portal Culture · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
