'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        if (typeof window === 'undefined') return

        const hash = window.location.hash.replace('#', '')
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (!accessToken || !refreshToken || type !== 'signup') {
          setStatus('error')
          setMessage('El enlace de confirmación es inválido o expiró.')
          return
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setStatus('error')
          setMessage('No pudimos validar tu email. Solicita un nuevo enlace.')
          return
        }

        setStatus('success')
        setMessage('Email confirmado. Ya puedes iniciar sesión.')
        setTimeout(() => router.push('/'), 2500)
      } catch {
        setStatus('error')
        setMessage('Ocurrió un error al confirmar tu email.')
      }
    }

    confirmEmail()
  }, [supabase, router])

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 50% at 50% 20%,
                rgba(168, 85, 247, 0.08) 0%,
                rgba(147, 51, 234, 0.05) 20%,
                rgba(126, 34, 206, 0.03) 40%,
                rgba(107, 33, 168, 0.018) 60%,
                transparent 80%
              ),
              radial-gradient(
                ellipse 80% 60% at 50% 80%,
                rgba(59, 130, 246, 0.06) 0%,
                rgba(37, 99, 235, 0.04) 25%,
                rgba(29, 78, 216, 0.02) 50%,
                transparent 80%
              )
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="relative mx-auto mb-6 h-28 w-28">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-2 rounded-full border border-white/15" />
            <div className="absolute inset-4 rounded-full border border-white/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              {status === 'loading' && (
                <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
              )}
              {status === 'success' && (
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="h-12 w-12 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-2">
            {status === 'loading' && 'Confirmando...'}
            {status === 'success' && 'Email confirmado'}
            {status === 'error' && 'Error de confirmación'}
          </h1>
          <p className="text-white/60 text-sm mb-6">{message || 'Procesando tu confirmación'}</p>

          {status === 'success' && (
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-xl bg-white text-black py-3 font-medium transition-all hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
            >
              Ir a iniciar sesión
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-xl bg-white text-black py-3 font-medium transition-all hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
            >
              Volver al login
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
