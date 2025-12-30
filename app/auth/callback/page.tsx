'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const expiresIn = hashParams.get('expires_in')

        console.log('Tokens:', { 
          hasAccess: !!accessToken,
          hasRefresh: !!refreshToken,
          accessLength: accessToken?.length || 0,
          refreshLength: refreshToken?.length || 0,
          expiresIn
        })

        if (accessToken) {
          // Try to set session even without refresh token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '' // Empty string if no refresh token
          })

          if (error) {
            console.error('setSession error:', error.message)
            // Try alternative: just set the token and let Supabase handle it
            try {
              // Store token manually in localStorage
              localStorage.setItem('sb-access-token', accessToken)
              if (refreshToken) {
                localStorage.setItem('sb-refresh-token', refreshToken)
              }
              console.log('✅ Tokens stored in localStorage')
              router.push('/dashboard')
              return
            } catch (storageError) {
              console.error('localStorage error:', storageError)
              setError('Error guardando sesión')
              setTimeout(() => router.push('/'), 2000)
              return
            }
          }

          console.log('✅ Session set:', data.user?.email)
          router.push('/dashboard')
        } else {
          console.log('No access token, checking existing session...')
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            router.push('/dashboard')
          } else {
            router.push('/')
          }
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('Error procesando autenticación')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-400 text-lg">❌ {error}</div>
          <div className="text-white/40 text-sm">Redirigiendo...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Completando inicio de sesión...</p>
      </div>
    </div>
  )
}
