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
        setChecking(false)
        return
      }

      if (profile.access_status === 'approved' || profile.access_status === 'paid') {
        router.push('/dashboard')
      } else {
        // Still pending
        setChecking(false)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setChecking(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6">
      <MeshGradient variant="subtle" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
          Solicitud en revisión
        </h1>

        {/* Description */}
        <p className="text-white/50 text-sm md:text-base mb-8 leading-relaxed">
          Estamos revisando tu perfil. Te notificaremos cuando seas aprobado.
          <br />
          <span className="text-white/30">Normalmente 24-48 horas</span>
        </p>

        {/* User email */}
        {userEmail && (
          <p className="text-white/30 text-xs mb-8">
            Cuenta: {userEmail}
          </p>
        )}

        {/* Check status button */}
        <button
          onClick={checkStatus}
          disabled={checking}
          className="w-full py-3.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors disabled:opacity-50 mb-4"
        >
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando...
            </span>
          ) : 'Comprobar estado'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-white/30 text-sm hover:text-white/50 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
