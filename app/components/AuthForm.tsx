'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setOauthLoading(provider)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      setMessage({ type: 'error', text: authError.message || 'Error al conectar' })
      setOauthLoading(null)
    }
  }

  const handleRegisterClick = () => {
    // Redirect to typeform registration
    router.push('/register')
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Login with email/password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setMessage({ type: 'success', text: '¡Bienvenido de vuelta!' })
    } catch (error) {
      const authError = error as AuthError
      setMessage({ type: 'error', text: authError.message || 'Algo salió mal' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-black relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/3 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            Portal Culture
          </h1>
          <p className="text-white/60 text-sm">
            {isLogin ? 'Accede a tu cuenta' : 'Únete a la comunidad'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-fadeIn">
          {!isLogin ? (
            // Registration view - just show the button
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2 text-white">Proceso de Selección</h2>
                <p className="text-sm text-white/60">
                  Completa el formulario para solicitar tu acceso a la comunidad
                </p>
              </div>

              <button
                onClick={handleRegisterClick}
                className="w-full py-4 px-6 chrome-btn rounded-xl font-semibold text-white"
              >
                Continuar al Registro
              </button>

              <div className="text-center text-xs text-white/40">
                100% gratuito · Respuesta en 24h
              </div>
            </div>
          ) : (
            // Login form
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/80">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-white/80">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm ${
                  message.type === 'error' 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-green-500/10 border border-green-500/20 text-green-400'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 chrome-btn rounded-xl font-semibold text-white
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          )}

          {/* OAuth Buttons */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/40">
                  {isLogin ? 'O inicia sesión con' : 'O regístrate con'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center gap-2 py-3 px-4 
                         bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                         rounded-xl transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-white">Google</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleOAuthLogin('discord')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center gap-2 py-3 px-4 
                         bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 hover:border-[#5865F2]/40
                         rounded-xl transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'discord' ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="text-sm font-medium text-white">Discord</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setMessage(null)
              }}
              className="text-sm text-white/60 hover:text-white transition-colors"
              disabled={loading || oauthLoading !== null}
            >
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <span className="text-white font-medium">
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-white/40 mt-8">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  )
}
