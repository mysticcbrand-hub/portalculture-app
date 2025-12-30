'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
      
      // If not logged in, redirect to home
      if (!user) {
        router.push('/')
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (!session?.user) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Typeform Embed Script */}
      <Script src="//embed.typeform.com/next/embed.js" strategy="lazyOnload" />

      {/* Header with logout */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Portal Culture</h1>
            {user && (
              <span className="text-sm text-white/60">
                {user.user_metadata?.name || user.email}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Welcome message */}
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
          ¡Bienvenido al proceso de selección!
        </h2>
        <p className="text-white/60 text-lg mb-2">
          Completa este formulario para solicitar tu acceso a Portal Culture
        </p>
        <p className="text-white/40 text-sm">
          Respuesta en menos de 24h · 100% gratuito
        </p>
      </div>

      {/* Typeform Embed - Full screen with custom styling */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full h-full max-w-5xl">
            {/* Typeform Widget Container */}
            <div 
              data-tf-live="01KDNY02YBPCQYJ5MTTVWPCZ2J"
              data-tf-hidden={`name=${user?.user_metadata?.name || user?.user_metadata?.full_name || ''},email=${user?.email || ''}`}
              data-tf-opacity="0"
              data-tf-iframe-props="title=Portal Culture Registration"
              data-tf-transitive-search-params
              data-tf-medium="snippet"
              data-tf-on-submit="handleTypeformSubmit"
              className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ 
                height: 'calc(100vh - 240px)',
                minHeight: '500px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Script to handle typeform submission */}
      <Script id="typeform-handler" strategy="lazyOnload">
        {`
          window.handleTypeformSubmit = function() {
            // Redirect to dashboard after form submission
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          }
        `}
      </Script>
    </div>
  )
}
