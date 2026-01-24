'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import AICoach from '@/components/AICoach'

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

  const courses = [
    { id: 1, emoji: '🧠', name: 'Templo de Atenas', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 2, emoji: '💪', name: 'Templo de Ares', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 3, emoji: '🗣️', name: 'Templo de Apolo', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 4, emoji: '⚡', name: 'Templo de Zeus', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 5, emoji: '🧲', name: 'Templo de Adonis', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Hero-style Background - B&W VISIBLE Version */}
      <div className="fixed inset-0 bg-black -z-10">
        {/* Primary gradient glow - white/gray (INCREASED opacity) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse 80% 60% at 50% 45%,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(200, 200, 200, 0.08) 30%,
              rgba(150, 150, 150, 0.04) 50%,
              transparent 70%
            )`,
          }}
        />
        
        {/* Secondary subtle accent - lighter gray (INCREASED) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 70% 20%, rgba(180, 180, 180, 0.08) 0%, rgba(140, 140, 140, 0.04) 40%, transparent 60%)',
          }}
        />
        
        {/* Noise texture - visible anti-banding */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.05,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* Header - Liquid Glass */}
      <header className="liquid-glass border-b border-white/10 sticky top-0 z-50 rounded-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Portal Culture" className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-lg md:text-xl font-bold text-white">Portal Culture</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-gray-400 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="liquid-glass-button px-3 md:px-4 py-2 text-xs md:text-sm rounded-xl"
            >
              Salir
            </button>
          </div>
        </div>
      </header>


      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 overflow-x-hidden">
        {/* Welcome section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-3 md:mb-4 break-words">
            Bienvenido a Portal Culture
          </h2>
          <p className="text-sm md:text-base lg:text-xl text-gray-400">
            Tu comunidad exclusiva de desarrollo personal y crecimiento.
          </p>
        </div>

        {/* Discord Card - Liquid Glass */}
        <div className="mb-8">
          <a
            href="https://whop.com/checkout/plan_2kXdGgagLpw4A"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-card p-6 md:p-8 block group"
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
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6">Los 5 Templos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {courses.map((course) => (
              <a
                key={course.id}
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass-card p-6 block group"
              >
                <div className="text-4xl mb-4">{course.emoji}</div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">{course.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors">
                  <span>Acceder</span>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

      </main>

      {/* AI Coach Widget */}
      <AICoach />
    </div>
  )
}
