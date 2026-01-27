'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import AICoach from '@/components/AICoach'
import MeshGradient from '@/components/MeshGradient'

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
            <div className="absolute inset-2 w-10 h-10 rounded-full border border-transparent border-t-white/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white/40 text-sm font-light tracking-wide">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const courses = [
    { id: 1, emoji: '🧠', name: 'Templo de Atenas', description: 'Sabiduría y conocimiento', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 2, emoji: '💪', name: 'Templo de Ares', description: 'Fuerza y disciplina', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 3, emoji: '🗣️', name: 'Templo de Apolo', description: 'Comunicación y carisma', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 4, emoji: '⚡', name: 'Templo de Zeus', description: 'Liderazgo y poder', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
    { id: 5, emoji: '🧲', name: 'Templo de Adonis', description: 'Atractivo y presencia', link: 'https://whop.com/joined/portalculture/cursos-portal-academy-rDBxyPFiZ166QM/app/' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Premium Mesh Gradient Background */}
      <MeshGradient variant="default" intensity="low" />

      {/* Premium Header - Glassmorphism */}
      <header 
        className="sticky top-0 z-50 border-b border-white/[0.06]"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Portal Culture" className="w-9 h-9 md:w-10 md:h-10" />
            <span className="text-lg md:text-xl font-bold text-white tracking-tight">Portal Culture</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/[0.08]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40 truncate max-w-[150px]">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 text-xs font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all duration-300"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 overflow-x-hidden">
        {/* Welcome section */}
        <div className="mb-10 md:mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-full border border-white/[0.06] mb-4">
            <span className="text-xs text-white/40">👋 Bienvenido de nuevo</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 break-words">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Tu portal al crecimiento
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-2xl">
            Accede a los 5 Templos, conecta con la comunidad y transforma tu vida.
          </p>
        </div>

        {/* Discord Card - Premium */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <a
            href="https://whop.com/checkout/plan_2kXdGgagLpw4A"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block"
          >
            {/* Glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl" />
            
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-black/50">
              {/* Top highlight */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 md:p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-full border border-white/[0.06] group-hover:border-white/[0.12] transition-all">
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Unirse</span>
                  <svg className="w-4 h-4 text-white/40 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Comunidad Discord</h3>
              <p className="text-sm md:text-base text-white/40">
                Conecta con otros miembros, participa en desafíos semanales y comparte tu progreso con la comunidad.
              </p>
            </div>
          </a>
        </div>

        {/* Courses Section */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Los 5 Templos</h3>
            <span className="text-xs text-white/30 uppercase tracking-wider">Tu camino</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
            {courses.map((course, index) => (
              <a
                key={course.id}
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group block animate-fade-in-up"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                {/* Hover glow */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <div className="relative bg-black/30 backdrop-blur-xl border border-white/[0.04] rounded-2xl p-5 md:p-6 transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-black/40">
                  {/* Emoji with glow */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 blur-xl opacity-30 group-hover:opacity-50 transition-opacity">{course.emoji}</div>
                    <div className="text-4xl relative">{course.emoji}</div>
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-1 text-white group-hover:text-white transition-colors">{course.name}</h4>
                  <p className="text-xs text-white/30 mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-white/40 group-hover:text-white/70 transition-all">
                    <span>Acceder</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/[0.03]">
          <p className="text-white/15 text-xs">© 2026 Portal Culture · Todos los derechos reservados</p>
        </div>
      </main>

      {/* AI Coach Widget */}
      <AICoach />
    </div>
  )
}
