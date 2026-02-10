'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import MeshGradient from '@/components/MeshGradient'

// Premium Loading Component
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

// Main component wrapped in Suspense for useSearchParams
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for invite link parameters and existing session
  useEffect(() => {
    const checkSessionAndInvite = async () => {
      // Check for invite link params
      const inviteEmail = searchParams.get('email')
      const approved = searchParams.get('approved')
      
      if (inviteEmail && approved === 'true') {
        // User came from invite link - pre-fill email and switch to register
        setEmail(decodeURIComponent(inviteEmail))
        setMode('register')
        setIsApprovedInvite(true)
        setCheckingSession(false)
        return
      }

      // Check for existing session
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User is already logged in - redirect to appropriate page
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

  // Password validation
  const passwordRequirements = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const isPasswordValid = passwordRequirements.length && passwordRequirements.case && passwordRequirements.special
  const passwordsMatch = password === confirmPassword

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Handle login
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

      // Successful login - redirect based on user
      showToast('¡Bienvenido de nuevo!', 'success')
      
      // Direct redirect with window.location (more reliable)
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

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validations
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
        throw new Error(data.error || 'Error al crear la cuenta')
      }

      // Check if email confirmation is needed
      if (data.needsEmailConfirmation) {
        // Show message to check email
        showToast('✅ Cuenta creada. Revisa tu email para confirmar.', 'success')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setAcceptedTerms(false)
        setError(null)
      } else {
        // No confirmation needed - auto-login
        showToast('¡Cuenta creada! Iniciando sesión...', 'success')
        
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (loginResponse.ok) {
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 300)
        } else {
          setMode('login')
          setPassword('')
          setConfirmPassword('')
          setAcceptedTerms(false)
          showToast('Cuenta creada. Por favor inicia sesión.', 'success')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle forgot password
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

  // Show loading while checking session
  if (checkingSession) {
    return <PremiumLoader />
  }

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center px-4 py-10 sm:py-12 relative overflow-hidden">
      {/* Premium Mesh Gradient Background - darker like landing */}
      <MeshGradient variant="midnight" intensity="high" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 20% 10%, rgba(30, 64, 175, 0.18) 0%, rgba(30, 58, 138, 0.10) 35%, transparent 70%),
          radial-gradient(ellipse 80% 70% at 85% 75%, rgba(109, 40, 217, 0.16) 0%, rgba(88, 28, 135, 0.09) 40%, transparent 75%),
          radial-gradient(ellipse 70% 60% at 50% 30%, rgba(30, 64, 175, 0.12) 0%, rgba(30, 58, 138, 0.07) 45%, transparent 75%),
          linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.65) 100%)`
        }}
      />

      {/* Toast notification - Premium style */}
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

      <div className="relative z-10 w-full max-w-[380px] animate-fade-in-up">
        {/* Logo with premium glow effect */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="relative inline-block">
            {/* Subtle glow behind logo */}
            <div className="absolute -inset-8 bg-white/5 blur-3xl rounded-full opacity-50" />
            <h1 className="relative text-2xl sm:text-3xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 40%, #ffffff 60%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              PORTAL CULTURE
            </h1>
          </div>
          <p className="text-white/30 text-sm mt-2 tracking-widest uppercase font-light">Desbloquea tu potencial</p>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword ? (
          <div className="relative group animate-scale-in">
            {/* Subtle outer glow - verde temático */}
            <div 
              className="absolute -inset-3 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 115% 105% at 50% 50%, rgba(167,243,208,0.08) 0%, rgba(110,231,183,0.04) 40%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />
            
            {/* Liquid Glass Card */}
            <div 
              className="relative backdrop-blur-xl backdrop-saturate-150 border rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.05)] transition-all duration-700 ease-out group-hover:backdrop-blur-2xl group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.08)]"
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.08) 0%,
                    rgba(255, 255, 255, 0.05) 50%,
                    rgba(255, 255, 255, 0.03) 100%
                  )
                `,
                borderColor: 'rgba(255, 255, 255, 0.10)',
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              }}
            >
              {/* Specular highlight sutil */}
              <div 
                className="absolute top-0 left-12 right-12 h-px opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                }}
              />
              
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-white/40 hover:text-white/80 mb-6 text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-x-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              
              <h2 className="text-xl font-semibold text-white mb-2">Restablecer contraseña</h2>
              <p className="text-sm text-white/40 mb-8">Te enviaremos un enlace para restablecer tu contraseña</p>
              
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="relative group/input">
                  <label className="block text-white/50 text-xs font-medium mb-2 ml-1 tracking-wide">Email de recuperación</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.05] border border-white/[0.10] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-500 ease-premium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      placeholder="tu@email.com"
                      required
                    />
                    {/* Focus glow effect */}
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    {/* Subtle shine on top */}
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_50px_rgba(167,243,208,0.3),0_0_80px_rgba(110,231,183,0.15)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">{loading ? 'Enviando...' : 'Enviar enlace'}</span>
                  {/* Enhanced shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Main Auth Card */
          <div className="relative group animate-scale-in">
            {/* Subtle outer glow - solo en hover */}
            <div 
              className="absolute -inset-3 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 115% 105% at 50% 50%, rgba(147,197,253,0.08) 0%, rgba(96,165,250,0.04) 40%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />
            
            {/* Liquid Glass Card - interactúa con el fondo */}
            <div 
              className={`
                relative backdrop-blur-xl backdrop-saturate-150 border rounded-3xl p-6 sm:p-8 
                shadow-[0_8px_32px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.05)]
                transition-all duration-700 ease-out
                group-hover:backdrop-blur-2xl
                group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.08)]
                ${mode === 'register' ? 'pb-8 sm:pb-10' : ''}
              `}
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.08) 0%,
                    rgba(255, 255, 255, 0.05) 50%,
                    rgba(255, 255, 255, 0.03) 100%
                  )
                `,
                borderColor: 'rgba(255, 255, 255, 0.10)',
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              }}
            >
              {/* Specular highlight sutil en top */}
              <div 
                className="absolute top-0 left-12 right-12 h-px opacity-60"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                }}
              />
              
              {/* Corner indicators minimalistas */}
              <div className="absolute top-3 left-3 w-8 h-8 border-l border-t border-white/10 rounded-tl-lg opacity-50" />
              <div className="absolute top-3 right-3 w-8 h-8 border-r border-t border-white/10 rounded-tr-lg opacity-50" />
              
              {/* Sutil inner light desde arriba */}
              <div 
                className="absolute inset-x-0 top-0 h-20 rounded-t-3xl pointer-events-none opacity-40"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                }}
              />
              
              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="relative space-y-4 sm:space-y-5">
                  {/* Email Input */}
                  <div className="relative group/input">
                    <label className="block text-white/50 text-xs font-medium mb-2 ml-1 tracking-wide">Correo electrónico</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-3.5 sm:py-4 bg-white/[0.05] border border-white/[0.10] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-500 ease-premium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        placeholder="tu@email.com"
                        required
                      />
                      {/* Focus glow effect */}
                      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      {/* Subtle shine on top */}
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group/input">
                    <label className="block text-white/50 text-xs font-medium mb-2 ml-1 tracking-wide">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-3.5 sm:py-4 pr-12 bg-white/[0.05] border border-white/[0.10] rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-500 ease-premium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
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
                      {/* Focus glow effect */}
                      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      {/* Subtle shine on top */}
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3.5 sm:py-4 mt-2 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_50px_rgba(147,197,253,0.4),0_0_80px_rgba(96,165,250,0.2)] hover:scale-[1.02] active:scale-[0.98]"
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
                    {/* Enhanced shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                  </button>

                  <div className="relative flex items-center gap-3 py-1.5 sm:py-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">o</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid gap-3">
                    {/* Google Button - Premium */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={oauthLoading !== null}
                      className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.04] text-white text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:from-white/[0.12] hover:to-white/[0.06] hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
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
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 group-hover/oauth:animate-shimmer pointer-events-none" />
                    </button>

                    {/* Discord Button - Premium */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('discord')}
                      disabled={oauthLoading !== null}
                      className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/[0.15] to-[#5865F2]/[0.08] text-white text-sm font-semibold transition-all duration-300 hover:border-[#5865F2]/50 hover:from-[#5865F2]/[0.20] hover:to-[#5865F2]/[0.12] hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.2)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#5865F2] shadow-lg">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <span className="flex-1 text-center">
                        {oauthLoading === 'discord' ? 'Conectando...' : 'Continuar con Discord'}
                      </span>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 group-hover/oauth:animate-shimmer pointer-events-none" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-all duration-300 cursor-pointer py-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="relative space-y-4 sm:space-y-5">
                  {/* Email Input */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-3.5 sm:py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-3.5 sm:py-4 pr-12 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
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
                    
                    {/* Premium Password requirements */}
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] space-y-2">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider font-medium mb-3">Requisitos</p>
                      <div className={`flex items-center gap-3 text-xs transition-all duration-500 ${passwordRequirements.length ? 'text-emerald-400' : 'text-white/25'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${passwordRequirements.length ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                          {passwordRequirements.length ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          )}
                        </div>
                        Mínimo 8 caracteres
                      </div>
                      <div className={`flex items-center gap-3 text-xs transition-all duration-500 ${passwordRequirements.case ? 'text-emerald-400' : 'text-white/25'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${passwordRequirements.case ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                          {passwordRequirements.case ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          )}
                        </div>
                        1 mayúscula y 1 minúscula
                      </div>
                      <div className={`flex items-center gap-3 text-xs transition-all duration-500 ${passwordRequirements.special ? 'text-emerald-400' : 'text-white/25'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${passwordRequirements.special ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                          {passwordRequirements.special ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          )}
                        </div>
                        1 carácter especial (!@#$%...)
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Repetir contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-5 py-3.5 sm:py-4 pr-12 bg-white/[0.03] border rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-white/[0.06] transition-all duration-500 ease-premium ${
                          confirmPassword && !passwordsMatch ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/[0.06] focus:border-white/20'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
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
                    {confirmPassword && !passwordsMatch && (
                      <div className="flex items-center gap-2 mt-2 ml-1">
                        <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-red-400 text-xs">Las contraseñas no coinciden</p>
                      </div>
                    )}
                    {confirmPassword && passwordsMatch && (
                      <div className="flex items-center gap-2 mt-2 ml-1">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-emerald-400 text-xs">Las contraseñas coinciden</p>
                      </div>
                    )}
                  </div>

                  {/* Premium Terms checkbox */}
                  <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group/check p-3 sm:p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
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
                          : 'bg-transparent border-white/20 group-hover/check:border-white/40'
                      }`}>
                        {acceptedTerms && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-white/40 leading-relaxed group-hover/check:text-white/60 transition-colors">
                      Acepto los{' '}
                      <a href="/terminos" className="text-white/70 underline decoration-white/30 hover:text-white hover:decoration-white/60 transition-all">términos de uso</a>
                      {' '}y las{' '}
                      <a href="/privacidad" className="text-white/70 underline decoration-white/30 hover:text-white hover:decoration-white/60 transition-all">políticas del club</a>
                    </span>
                  </label>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid || !passwordsMatch || !acceptedTerms}
                    className="relative w-full py-4 mt-2 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-[0.98]"
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
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </button>

                  <div className="relative flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">o</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid gap-3">
                    {/* Google Button - Premium */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={oauthLoading !== null}
                      className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.04] text-white text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:from-white/[0.12] hover:to-white/[0.06] hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
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
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 group-hover/oauth:animate-shimmer pointer-events-none" />
                    </button>

                    {/* Discord Button - Premium */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('discord')}
                      disabled={oauthLoading !== null}
                      className="group/oauth relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/[0.15] to-[#5865F2]/[0.08] text-white text-sm font-semibold transition-all duration-300 hover:border-[#5865F2]/50 hover:from-[#5865F2]/[0.20] hover:to-[#5865F2]/[0.12] hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.2)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#5865F2] shadow-lg">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <span className="flex-1 text-center">
                        {oauthLoading === 'discord' ? 'Conectando...' : 'Registrarse con Discord'}
                      </span>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/oauth:opacity-100 group-hover/oauth:animate-shimmer pointer-events-none" />
                    </button>
                  </div>
                </form>
              )}

              {/* Toggle mode */}
              <div className="relative mt-8 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-white/30">
                  {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login')
                      setError(null)
                      setPassword('')
                      setConfirmPassword('')
                    }}
                    className="ml-2 text-white/70 hover:text-white transition-all duration-300 cursor-pointer font-medium hover:underline underline-offset-4 decoration-white/30"
                  >
                    {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium footer */}
        <div className="text-center mt-10 space-y-3">
          <div className="flex items-center justify-center gap-6 text-white/20">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Seguro</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Privado</span>
            </div>
          </div>
          <p className="text-[10px] text-white/15 tracking-wider">
            © 2026 Portal Culture · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
