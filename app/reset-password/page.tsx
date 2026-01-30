'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordRequirements = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const isPasswordValid =
    passwordRequirements.length &&
    passwordRequirements.case &&
    passwordRequirements.special

  useEffect(() => {
    const initializeRecovery = async () => {
      try {
        if (typeof window === 'undefined') return

        const hash = window.location.hash.replace('#', '')
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (!accessToken || !refreshToken || type !== 'recovery') {
          setError('El enlace de recuperación es inválido o expiró. Solicita uno nuevo.')
          setLoading(false)
          return
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError('No pudimos validar tu enlace. Solicita un nuevo correo de recuperación.')
        }
      } catch {
        setError('Ocurrió un error al validar el enlace de recuperación.')
      } finally {
        setLoading(false)
      }
    }

    initializeRecovery()
  }, [supabase])

  const handleUpdatePassword = async () => {
    if (!isPasswordValid || password !== confirmPassword) {
      setError('La contraseña no cumple los requisitos o no coincide.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError('No pudimos actualizar tu contraseña. Intenta de nuevo.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 60% at 50% 20%,
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

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <h1 className="text-2xl font-semibold text-white mb-2">Restablecer contraseña</h1>
          <p className="text-white/50 text-sm mb-6">
            Crea una nueva contraseña para tu cuenta.
          </p>

          {loading && !success && (
            <div className="text-white/60 text-sm">Validando enlace...</div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Contraseña actualizada. Te llevamos al login...
            </div>
          )}

          {!loading && !success && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/[0.08] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/[0.08] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className={passwordRequirements.length ? 'text-emerald-300' : 'text-white/30'}>• Mínimo 8 caracteres</div>
                <div className={passwordRequirements.case ? 'text-emerald-300' : 'text-white/30'}>• Mayúscula y minúscula</div>
                <div className={passwordRequirements.special ? 'text-emerald-300' : 'text-white/30'}>• Un carácter especial</div>
              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={loading || !isPasswordValid || password !== confirmPassword}
                className="w-full rounded-xl bg-white text-black py-3 font-medium transition-all hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] disabled:opacity-50"
              >
                Actualizar contraseña
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
