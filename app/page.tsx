'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const router = useRouter()

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

      // Redirect to access selection
      router.push('/seleccionar-acceso')
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

      // Show success toast and switch to login
      showToast('Cuenta creada. Verifica tu correo para confirmar.', 'success')
      setMode('login')
      setPassword('')
      setConfirmPassword('')
      setAcceptedTerms(false)
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-900/50" />
      
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            PORTAL CULTURE
          </h1>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword ? (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
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
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="tu@email.com"
                required
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </div>
        ) : (
          /* Main Auth Card */
          <div 
            className={`
              bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl
              transition-all duration-500 ease-out
              ${mode === 'register' ? 'pb-8' : ''}
            `}
          >
            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Correo electrónico"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Contraseña"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Correo electrónico"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Contraseña"
                    required
                  />
                  
                  {/* Password requirements */}
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.length ? 'text-green-400' : 'text-white/30'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordRequirements.length ? 'bg-green-400' : 'bg-white/30'}`} />
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.case ? 'text-green-400' : 'text-white/30'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordRequirements.case ? 'bg-green-400' : 'bg-white/30'}`} />
                      1 mayúscula y 1 minúscula
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.special ? 'text-green-400' : 'text-white/30'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordRequirements.special ? 'bg-green-400' : 'bg-white/30'}`} />
                      1 carácter especial (!@#$%...)
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                      confirmPassword && !passwordsMatch ? 'border-red-500/50' : 'border-white/10 focus:border-white/20'
                    }`}
                    placeholder="Repetir contraseña"
                    required
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-white/50 leading-relaxed">
                    Acepto los{' '}
                    <a href="/terminos" className="text-white/70 underline hover:text-white">términos de uso</a>
                    {' '}y las{' '}
                    <a href="/privacidad" className="text-white/70 underline hover:text-white">políticas del club</a>
                  </span>
                </label>

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid || !passwordsMatch || !acceptedTerms}
                  className="w-full py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            )}

            {/* Toggle mode */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center">
              <p className="text-xs text-white/40">
                {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setError(null)
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="ml-1 text-white/70 hover:text-white transition-colors"
                >
                  {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
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
      `}</style>
    </div>
  )
}
