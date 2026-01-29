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
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [isApprovedInvite, setIsApprovedInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
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

  // Show loading while checking session
  if (checkingSession) {
    return <PremiumLoader />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Mesh Gradient Background */}
      <MeshGradient variant="aurora" intensity="medium" />

      {/* Toast notification - Premium style */}
      {toast && (
        <div 
          className={`
            fixed top-6 left-1/2 -translate-x-1/2 z-50
            px-5 py-3.5 rounded-2xl
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
        <div className="text-center mb-10">
          <div className="relative inline-block">
            {/* Subtle glow behind logo */}
            <div className="absolute -inset-8 bg-white/5 blur-3xl rounded-full opacity-50" />
            <h1 className="relative text-3xl font-bold tracking-tight"
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
            {/* Premium card glow effect */}
            {/* Debanded glow layers */}
            <div 
              className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 110% 100% at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 30%, transparent 60%)`,
                filter: 'blur(16px)',
              }}
            />
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative bg-black/60 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
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
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                    placeholder="tu@email.com"
                    required
                  />
                  {/* Focus glow */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  <span className="relative z-10">{loading ? 'Enviando...' : 'Enviar enlace'}</span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-shimmer opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-shimmer" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Main Auth Card */
          <div className="relative group animate-scale-in">
            {/* Premium multi-layer glow effect */}
            {/* Debanded glow layers */}
            <div 
              className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 110% 100% at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 30%, transparent 60%)`,
                filter: 'blur(16px)',
              }}
            />
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div 
              className={`
                relative bg-black/60 backdrop-blur-3xl border border-white/[0.06] rounded-3xl p-8 
                shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
                transition-all duration-500 ease-premium
                ${mode === 'register' ? 'pb-10' : ''}
              `}
            >
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Subtle corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-white/10 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-white/10 rounded-tr-lg" />
              
              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="relative space-y-5">
                  {/* Email Input */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                      placeholder="tu@email.com"
                      required
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-12 rounded-2xl bg-gradient-to-b from-white/0 to-white/[0.02] opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Password Input */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-12 rounded-2xl bg-gradient-to-b from-white/0 to-white/[0.02] opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
                    className="relative w-full py-4 mt-2 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-[0.98]"
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
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </button>

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
                <form onSubmit={handleRegister} className="relative space-y-5">
                  {/* Email Input */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative group/input">
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-500 ease-premium"
                      placeholder="••••••••"
                      required
                    />
                    
                    {/* Premium Password requirements */}
                    <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] space-y-2.5">
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
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-5 py-4 bg-white/[0.03] border rounded-2xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-white/[0.06] transition-all duration-500 ease-premium ${
                        confirmPassword && !passwordsMatch ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/[0.06] focus:border-white/20'
                      }`}
                      placeholder="••••••••"
                      required
                    />
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
                  <label className="flex items-start gap-4 cursor-pointer group/check p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
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
