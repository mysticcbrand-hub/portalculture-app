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
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        console.log('Callback - Hash params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        })

        if (accessToken && refreshToken) {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Error setting session:', error)
            setError(error.message)
            setTimeout(() => router.push('/'), 2000)
            return
          }

          console.log('✅ Session set successfully:', data.session?.user.email)
          
          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('No tokens in hash, checking session...')
          
          // Check if session exists
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            console.log('✅ Session exists, redirecting to dashboard')
            router.push('/dashboard')
          } else {
            console.log('No session found, redirecting to home')
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
