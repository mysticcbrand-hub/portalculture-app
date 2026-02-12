'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import MeshGradient from '@/components/MeshGradient'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [checking, setChecking] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const manualConfirm = searchParams.get('manualConfirm')
  const manualLink = searchParams.get('link')

  useEffect(() => {
    // Get email from URL params or from Supabase
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setUserEmail(emailParam)
    } else {
      // Try to get from session
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email || null)
        }
      }
      getUser()
    }
  }, [searchParams, supabase.auth])

  // Check if email has been verified
  const checkEmailVerification = async () => {
    setChecking(true)
    setStatusMessage(null)
    
    try {
      // Force refresh the session
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession()
      
      if (sessionError) {
        setStatusMessage('Error al verificar. Intenta de nuevo.')
        setChecking(false)
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setStatusMessage('No se encontró la sesión. Inicia sesión de nuevo.')
        setChecking(false)
        return
      }

      // Check if email is confirmed
      if (user.email_confirmed_at) {
        setShowSuccess(true)
        setStatusMessage('¡Email verificado! Redirigiendo...')
        
        // Redirect to seleccionar-acceso after success animation
        setTimeout(() => {
          router.push('/seleccionar-acceso')
        }, 2000)
      } else {
        setStatusMessage('Aún no has verificado tu email. Revisa tu bandeja de entrada.')
        setChecking(false)
      }
    } catch (error) {
      console.error('Error checking verification:', error)
      setStatusMessage('Error al verificar. Intenta de nuevo.')
      setChecking(false)
    }
  }

  const resendEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        setStatusMessage('Error al reenviar. Intenta más tarde.')
      } else {
        setStatusMessage('✅ Email reenviado. Revisa tu bandeja.')
      }
    } catch (error) {
      console.error('Error resending:', error)
      setStatusMessage('Error al reenviar el email.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6">
      <MeshGradient variant="subtle" intensity="medium" />

      <div className="max-w-md w-full relative z-10 animate-fade-in-up">
        {/* Premium Card */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative bg-black/50 backdrop-blur-3xl border border-white/[0.06] rounded-3xl p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Top highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            
            {/* Face ID Style Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              {/* Success animation rings */}
              {showSuccess && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/50 animate-ping" style={{ animationDuration: '1s' }} />
                  <div className="absolute inset-2 rounded-full border-2 border-emerald-400/30 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
                </>
              )}
              
              {/* Default pulsing rings */}
              {!showSuccess && (
                <>
                  <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-3 rounded-full border border-white/5 animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                </>
              )}
              
              {/* Icon container with Face ID style */}
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                showSuccess 
                  ? 'bg-emerald-500/20 border-2 border-emerald-400/50' 
                  : 'bg-white/[0.03] border border-white/10'
              }`}>
                {showSuccess ? (
                  // Success checkmark
                  <svg 
                    className="w-12 h-12 text-emerald-400 animate-scale-in" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  // Email/Face ID icon
                  <div className="relative">
                    <svg className="w-11 h-11 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {/* Scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-scan" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3 text-center">
              {showSuccess ? '¡Email Verificado!' : 'Verifica tu Email'}
            </h1>

            {/* Description */}
            <p className="text-white/40 text-sm md:text-base mb-8 leading-relaxed text-center">
              {showSuccess ? (
                <>
                  Tu cuenta ha sido verificada exitosamente.
                  <br />
                  <span className="text-emerald-400/60">Redirigiendo al siguiente paso...</span>
                </>
              ) : manualConfirm ? (
                <>
                  Hubo un problema enviando el email automático.
                  <br />
                  <span className="text-white/25">Usa el botón para confirmar manualmente</span>
                </>
              ) : (
                <>
                  Hemos enviado un enlace de verificación a tu email.
                  <br />
                  <span className="text-white/25">Revisa tu bandeja de entrada y spam</span>
                </>
              )}
            </p>

            {/* User email badge */}
            {userEmail && !showSuccess && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.06]">
                  <span className="text-white/50 text-sm">{userEmail}</span>
                </div>
              </div>
            )}

            {/* Status message */}
            {statusMessage && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm text-center animate-fade-in ${
                statusMessage.includes('verificado') || statusMessage.includes('✅')
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : statusMessage.includes('Error') || statusMessage.includes('no has')
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/50'
              }`}>
                {statusMessage}
              </div>
            )}

            {!showSuccess && (
              <>
                {/* Check verification button */}
                <button
                  onClick={checkEmailVerification}
                  disabled={checking}
                  className="relative w-full py-4 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-[0.98] mb-3"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {checking ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verificando...
                      </>
                    ) : manualConfirm ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Confirmar manualmente
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ya verifiqué mi email
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                </button>

                {manualConfirm && manualLink && (
                  <a
                    href={manualLink}
                    className="block w-full text-center text-sm font-semibold text-white/80 py-3 mb-2 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300"
                  >
                    Abrir enlace de confirmación
                  </a>
                )}

                {/* Resend email button */}
                {!manualConfirm && (
                  <button
                    onClick={resendEmail}
                    className="w-full text-white/40 text-sm hover:text-white/70 transition-all duration-300 py-3 mb-2 hover:bg-white/[0.02] rounded-xl"
                  >
                    Reenviar email de verificación
                  </button>
                )}

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-white/25 text-sm hover:text-white/50 transition-all duration-300 py-2"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-white/15 text-xs mt-6">
          ¿No recibiste el email? Revisa tu carpeta de spam
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(300%);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </main>
  )
}

function VerifyEmailLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
        </div>
        <p className="text-white/40 text-sm font-light tracking-wide">Cargando...</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoader />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
