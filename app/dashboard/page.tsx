'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to get session first
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          console.log('✅ User from session:', session.user.email)
          setUser(session.user)
          setLoading(false)
          return
        }

        // Fallback: check localStorage for manual token
        const accessToken = localStorage.getItem('sb-access-token')
        if (accessToken) {
          console.log('Found token in localStorage, attempting to use it...')
          // Try to get user with the token
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (user && !error) {
            console.log('✅ User from token:', user.email)
            setUser(user)
            setLoading(false)
            return
          }
        }
        
        console.log('No user found, redirecting...')
        if (mounted) {
          router.push('/')
        }
      } catch (err) {
        console.error('Get user error:', err)
        if (mounted) {
          setLoading(false)
          router.push('/')
        }
      }
    }

    getUser()

    return () => {
      mounted = false
    }
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem('sb-access-token')
    localStorage.removeItem('sb-refresh-token')
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/60">Redirigiendo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            Portal Culture
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60 hidden md:block">
              {user.user_metadata?.name || user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-white/60 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5 border border-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            Bienvenido a Portal Culture
          </h2>
          <p className="text-xl md:text-2xl text-white/60 mb-8 max-w-3xl mx-auto">
            Tu hub central para acceder a todo el contenido exclusivo
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="https://whop.com/joined/portalacademy/discord-czCjI6sxcVSfFY/app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#5865F2]/20 flex items-center justify-center border border-[#5865F2]/30">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Comunidad Discord</h3>
                  <p className="text-white/40 text-sm">Acceso verificado vía Whop</p>
                </div>
              </div>
              
              <p className="text-white/60 mb-6 leading-relaxed">
                Únete a la comunidad privada donde conectas con otros miembros
              </p>

              <div className="flex items-center gap-2 text-[#5865F2] font-medium">
                <span>Entrar al Discord</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </a>

          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Cursos Premium</h3>
                <p className="text-white/40 text-sm">Próximamente</p>
              </div>
            </div>
            
            <p className="text-white/60 mb-6">
              Contenido exclusivo que transforma tu vida
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
