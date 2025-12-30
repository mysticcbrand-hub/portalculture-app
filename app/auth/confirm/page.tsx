'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthConfirm() {
  const router = useRouter()

  useEffect(() => {
    // Handle the OAuth callback for implicit flow (hash fragment)
    const handleHashFragment = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken) {
        // Set the session with the tokens from the hash
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (!error) {
          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          console.error('Error setting session:', error)
          router.push('/')
        }
      } else {
        // No tokens, just redirect to dashboard (maybe already logged in)
        router.push('/dashboard')
      }
    }

    handleHashFragment()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Confirmando autenticación...</p>
      </div>
    </div>
  )
}
