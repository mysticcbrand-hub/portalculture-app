'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/')
          return
        }

        if (data.session) {
          console.log('✅ Session established:', data.session.user.email)
          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to home')
          router.push('/')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/')
      }
    }

    // Wait a bit for Supabase to process the callback
    const timeout = setTimeout(handleCallback, 1000)
    
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Completando inicio de sesión...</p>
      </div>
    </div>
  )
}
