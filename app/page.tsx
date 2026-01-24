'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
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

    checkSession()
  }, [router, supabase.auth])

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

      // Account created - now auto-login
      showToast('¡Cuenta creada! Iniciando sesión...', 'success')
      
      // Auto-login after registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (loginResponse.ok) {
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 300)
      } else {
        // If auto-login fails, switch to login mode
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setAcceptedTerms(false)
        showToast('Cuenta creada. Por favor inicia sesión.', 'success')
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Animated Mesh Gradient Background - Monochrome */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blob 1 - White/Light */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, #e5e5e5 30%, #a3a3a3 50%, transparent 70%)',
            top: '-15%',
            right: '-10%',
            animation: 'float1 18s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
        
        {/* Blob 2 - Gray */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #d4d4d4 0%, #a3a3a3 30%, #737373 50%, transparent 70%)',
            bottom: '-10%',
            left: '-5%',
            animation: 'float2 20s ease-in-out infinite',
            filter: 'blur(70px)',
          }}
        />
        
        {/* Blob 3 - Dark Gray */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #a3a3a3 0%, #737373 30%, #525252 50%, transparent 70%)',
            top: '40%',
            left: '20%',
            animation: 'float3 22s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Noise overlay for anti-banding */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
        
        {/* Depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Toast notification */}
      {toast && (
        <div 
          className={`
            fixed top-6 left-1/2 -translate-x-1/2 z-50
            px-5 py-3 rounded-xl
            backdrop-blur-xl border
            transition-all duration-500 ease-out
            animate-slide-down
            ${toast.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
            }
          `}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {toast.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #a3a3a3 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PORTAL CULTURE
          </h1>
          <p className="text-white/40 text-xs mt-1 tracking-wide">Desbloquea tu potencial</p>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword ? (
          <div className="relative group">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-white/[0.08] via-white/[0.05] to-white/[0.08] rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-white/50 hover:text-white mb-4 text-sm flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              
              <h2 className="text-lg font-medium text-white mb-2">Restablecer contraseña</h2>
              <p className="text-sm text-white/50 mb-6">Te enviaremos un enlace para restablecer tu contraseña</p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative group/input">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                    placeholder="tu@email.com"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-focus-within/input:from-white/[0.08] group-focus-within/input:via-white/[0.06] group-focus-within/input:to-white/[0.08] transition-all duration-300 pointer-events-none" />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Main Auth Card */
          <div className="relative group">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-white/[0.08] via-white/[0.05] to-white/[0.08] rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            
            <div 
              className={`
                relative bg-black/40 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                transition-all duration-500 ease-out
                ${mode === 'register' ? 'pb-8' : ''}
              `}
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none" />
              
              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="relative space-y-4">
                  <div className="relative group/input">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                      placeholder="Correo electrónico"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-focus-within/input:from-white/[0.08] group-focus-within/input:via-white/[0.06] group-focus-within/input:to-white/[0.08] transition-all duration-300 pointer-events-none" />
                  </div>

                  <div className="relative group/input">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                      placeholder="Contraseña"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-focus-within/input:from-white/[0.08] group-focus-within/input:via-white/[0.06] group-focus-within/input:to-white/[0.08] transition-all duration-300 pointer-events-none" />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="relative space-y-4">
                  <div className="relative group/input">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                      placeholder="Correo electrónico"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-focus-within/input:from-white/[0.08] group-focus-within/input:via-white/[0.06] group-focus-within/input:to-white/[0.08] transition-all duration-300 pointer-events-none" />
                  </div>

                  <div className="relative group/input">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                      placeholder="Contraseña"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-focus-within/input:from-white/[0.08] group-focus-within/input:via-white/[0.06] group-focus-within/input:to-white/[0.08] transition-all duration-300 pointer-events-none" />
                    
                    {/* Password requirements */}
                    <div className="mt-3 space-y-1.5 px-1">
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordRequirements.length ? 'text-emerald-400' : 'text-white/30'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passwordRequirements.length ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        Mínimo 8 caracteres
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordRequirements.case ? 'text-emerald-400' : 'text-white/30'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passwordRequirements.case ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        1 mayúscula y 1 minúscula
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordRequirements.special ? 'text-emerald-400' : 'text-white/30'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passwordRequirements.special ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        1 carácter especial (!@#$%...)
                      </div>
                    </div>
                  </div>

                  <div className="relative group/input">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-white/[0.03] border rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 ${
                        confirmPassword && !passwordsMatch ? 'border-red-500/40' : 'border-white/[0.08] focus:border-white/20'
                      }`}
                      placeholder="Repetir contraseña"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-focus-within/input:from-white/[0.08] group-focus-within/input:via-white/[0.06] group-focus-within/input:to-white/[0.08] transition-all duration-300 pointer-events-none" />
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-red-400 text-xs mt-2 px-1">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group/check px-1">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-white/40 leading-relaxed group-hover/check:text-white/60 transition-colors">
                      Acepto los{' '}
                      <a href="/terminos" className="text-white/60 underline hover:text-white transition-colors">términos de uso</a>
                      {' '}y las{' '}
                      <a href="/privacidad" className="text-white/60 underline hover:text-white transition-colors">políticas del club</a>
                    </span>
                  </label>

                  {error && (
                    <p className="text-red-400 text-xs px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid || !passwordsMatch || !acceptedTerms}
                    className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>
              )}

              {/* Toggle mode */}
              <div className="relative mt-6 pt-4 border-t border-white/[0.05] text-center">
                <p className="text-xs text-white/40">
                  {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login')
                      setError(null)
                      setPassword('')
                      setConfirmPassword('')
                    }}
                    className="ml-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-white/20 mt-6">
          © 2026 Portal Culture
        </p>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 40px) scale(1.08); }
          66% { transform: translate(25px, -30px) scale(0.92); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, 20px) scale(1.1); }
          66% { transform: translate(-30px, -40px) scale(0.9); }
        }
      `}</style>
    </div>
  )
}
