'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            PORTAL CULTURE
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-gray-400 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 md:px-4 py-2 text-xs md:text-sm glass glass-hover rounded-xl"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Welcome section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            Bienvenido a Portal Culture
          </h2>
          <p className="text-base md:text-xl text-gray-400">
            Tu comunidad exclusiva de desarrollo personal y crecimiento.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Discord card */}
          <a
            href="https://whop.com/joined/portalacademy/discord-czCjI6sxcVSfFY/app/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-hover rounded-2xl md:rounded-3xl p-6 md:p-8 block group"
          >
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="p-3 md:p-4 glass rounded-xl md:rounded-2xl">
                <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Comunidad Discord</h3>
            <p className="text-sm md:text-base text-gray-400">
              Únete a nuestra comunidad exclusiva. Conecta con otros miembros, participa en desafíos y comparte tu progreso.
            </p>
          </a>

          {/* Courses card */}
          <div className="glass rounded-2xl md:rounded-3xl p-6 md:p-8">
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="p-3 md:p-4 glass rounded-xl md:rounded-2xl">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Cursos Exclusivos</h3>
            <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
              Accede a contenido premium diseñado para acelerar tu crecimiento personal y profesional.
            </p>
            <div className="space-y-2 md:space-y-3">
              <div className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="font-medium mb-1 text-sm md:text-base">Mindset de Alto Rendimiento</p>
                <p className="text-xs md:text-sm text-gray-400">Próximamente</p>
              </div>
              <div className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="font-medium mb-1 text-sm md:text-base">Productividad Extrema</p>
                <p className="text-xs md:text-sm text-gray-400">Próximamente</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">¿Listo para crecer?</h3>
          <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
            Únete a la comunidad, accede a los cursos y empieza tu transformación hoy.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://whop.com/joined/portalacademy/discord-czCjI6sxcVSfFY/app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              Ir a Discord
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
