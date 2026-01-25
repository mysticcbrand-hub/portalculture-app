'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import MeshGradient from '@/components/MeshGradient'

export default function PendienteAprobacion() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    getUser()
  }, [supabase.auth])

  // Check if user has been approved
  const checkStatus = async () => {
    setChecking(true)
    setStatusMessage(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Try to get profile
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('access_status')
        .eq('id', user.id)
        .limit(1)

      if (error) {
        console.error('Profile query error:', error)
        setStatusMessage('Error al verificar. Intenta de nuevo.')
        setChecking(false)
        return
      }

      const profile = profiles?.[0]

      // If no profile exists, create one
      if (!profile) {
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            access_status: 'pending'
          })
        setStatusMessage('Tu solicitud sigue en revisión')
        setChecking(false)
        return
      }

      if (profile.access_status === 'approved' || profile.access_status === 'paid') {
        setStatusMessage('¡Aprobado! Redirigiendo...')
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        setStatusMessage('Tu solicitud sigue en revisión')
        setChecking(false)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setStatusMessage('Error al verificar')
      setChecking(false)
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
            
            {/* Animated Icon */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              
              {/* Icon container */}
              <div className="relative w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <svg className="w-9 h-9 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3 text-center">
              Solicitud en revisión
            </h1>

            {/* Description */}
            <p className="text-white/40 text-sm md:text-base mb-8 leading-relaxed text-center">
              Estamos revisando tu perfil cuidadosamente.
              <br />
              <span className="text-white/25">Tiempo estimado: 24-48 horas</span>
            </p>

            {/* User email badge */}
            {userEmail && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.06]">
                  <span className="text-white/30 text-xs">{userEmail}</span>
                </div>
              </div>
            )}

            {/* Status message */}
            {statusMessage && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm text-center animate-fade-in ${
                statusMessage.includes('Aprobado') 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : statusMessage.includes('Error')
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/50'
              }`}>
                {statusMessage}
              </div>
            )}

            {/* Check status button */}
            <button
              onClick={checkStatus}
              disabled={checking}
              className="relative w-full py-4 bg-white text-black text-sm font-semibold rounded-2xl overflow-hidden group/btn transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-[0.98] mb-4"
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
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Comprobar estado
                  </>
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-white/25 text-sm hover:text-white/50 transition-all duration-300 py-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-white/15 text-xs mt-6">
          ¿Tienes dudas? Contáctanos en Discord
        </p>
      </div>
    </main>
  )
}
