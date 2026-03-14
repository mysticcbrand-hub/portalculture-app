'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AICoach from '@/components/AICoach'

// ─── Types ──────────────────────────────────────────────────────────────────
interface Course {
  id: number
  emoji: string
  name: string
  short: string
  description: string
  link: string
  accent: string       // glow color
  border: string       // border gradient
  badge: string        // badge text
}

// ─── Data ───────────────────────────────────────────────────────────────────
const courses: Course[] = [
  {
    id: 1, emoji: '🏛️', name: 'Templo de Atenas', short: 'Atenas',
    description: 'Invoca tus sueños',
    link: 'https://whop.com/joined/portalculture/ebook-templo-de-atenas-VKPVER2AaIAavN/app/',
    accent: 'rgba(59,130,246,0.35)', border: 'rgba(59,130,246,0.5)',
    badge: 'Sabiduría',
  },
  {
    id: 2, emoji: '⚔️', name: 'Templo de Ares', short: 'Ares',
    description: 'Crea ese físico de Dios Griego',
    link: 'https://whop.com/joined/portalculture/ebook-templo-de-ares-jSgXtORjwh1M0A/app/',
    accent: 'rgba(220,38,38,0.35)', border: 'rgba(220,38,38,0.5)',
    badge: 'Disciplina',
  },
  {
    id: 3, emoji: '☀️', name: 'Templo de Apolo', short: 'Apolo',
    description: 'Carisma y confianza magnética',
    link: 'https://whop.com/joined/portalculture/ebook-templo-de-apolo-yuqFs2iAOwQRFN/app/',
    accent: 'rgba(234,179,8,0.35)', border: 'rgba(234,179,8,0.5)',
    badge: 'Carisma',
  },
  {
    id: 4, emoji: '⚡', name: 'Templo de Zeus', short: 'Zeus',
    description: 'Sana tu salud mental y traumas',
    link: 'https://whop.com/joined/portalculture/ebook-templo-de-zeus-aAmozpsLlv08Py/app/',
    accent: 'rgba(34,197,94,0.35)', border: 'rgba(34,197,94,0.5)',
    badge: 'Salud Mental',
  },
  {
    id: 5, emoji: '🌹', name: 'Templo de Adonis', short: 'Adonis',
    description: 'Presencia masculina que atrae a mujeres',
    link: 'https://whop.com/joined/portalculture/ebook-templo-de-adonis-MhivtaJx0e34P9/app/',
    accent: 'rgba(168,85,247,0.35)', border: 'rgba(168,85,247,0.5)',
    badge: 'Presencia',
  },
]

// ─── Greeting ────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return { text: 'Buenas noches', emoji: '🌙' }
  if (h < 13) return { text: 'Buenos días',   emoji: '🌅' }
  if (h < 20) return { text: 'Buenas tardes', emoji: '🌆' }
  return       { text: 'Buenas noches',       emoji: '🌙' }
}

function getFirstName(email: string) {
  return email?.split('@')[0]?.split('.')[0]?.charAt(0).toUpperCase() +
    (email?.split('@')[0]?.split('.')[0]?.slice(1) ?? '')
}

function getPreferredName(name?: string | null, fallbackEmail?: string | null) {
  if (name && name.trim()) return name.trim().split(' ')[0]
  if (fallbackEmail) return getFirstName(fallbackEmail)
  return 'ahí'
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: Course; index: number }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    setRotate({ x: ((y - r.height / 2) / r.height) * -10, y: ((x - r.width / 2) / r.width) * 10 })
    setGlow({ x: (x / r.width) * 100, y: (y / r.height) * 100 })
  }, [])

  const onLeave = useCallback(() => {
    setHovered(false)
    setRotate({ x: 0, y: 0 })
    setGlow({ x: 50, y: 50 })
  }, [])

  return (
    <a
      ref={ref}
      href={course.link}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(${hovered ? -6 : 0}px)`
          : 'translateY(24px)',
        transition: visible
          ? (hovered
              ? 'transform 0.1s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease'
              : 'transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease')
          : `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s`,
        transitionDelay: visible ? '0s' : `${index * 0.07}s`,
        willChange: 'transform',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Accent glow */}
      <div
        className="absolute -inset-px rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(ellipse 80% 80% at ${glow.x}% ${glow.y}%, ${course.accent} 0%, transparent 70%)`,
          filter: 'blur(1px)',
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl p-5 md:p-6 overflow-hidden h-full"
        style={{
          background: hovered
            ? `linear-gradient(145deg, rgba(18,12,30,0.97) 0%, rgba(10,7,20,0.99) 100%)`
            : 'linear-gradient(145deg, rgba(14,9,24,0.96) 0%, rgba(8,5,16,0.98) 100%)',
          border: `1px solid ${hovered ? course.border : 'rgba(255,255,255,0.07)'}`,
          boxShadow: hovered
            ? `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${course.accent}`
            : '0 8px 24px rgba(0,0,0,0.4)',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Shimmer top */}
        <div
          className="absolute top-0 left-4 right-4 h-px transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${course.border}, transparent)`,
            opacity: hovered ? 0.8 : 0.2,
          }}
        />

        {/* Mouse spotlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(circle 120px at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.04) 0%, transparent 70%)`,
          }}
        />

        {/* Emoji */}
        <div className="relative inline-block mb-4">
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: hovered ? 0.6 : 0, filter: 'blur(16px)', fontSize: '2.5rem' }}
          >
            {course.emoji}
          </div>
          <div className="text-4xl relative">{course.emoji}</div>
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium mb-3 transition-all duration-300"
          style={{
            background: `${course.accent.replace('0.35', '0.1')}`,
            border: `1px solid ${course.border.replace('0.5', '0.25')}`,
            color: course.border,
          }}
        >
          {course.badge}
        </div>

        <h4 className="text-base font-semibold mb-1 text-white">{course.name}</h4>
        <p className="text-xs text-white/35 mb-5 leading-relaxed">{course.description}</p>

        <div
          className="flex items-center gap-2 text-xs font-medium transition-all duration-300"
          style={{ color: hovered ? course.border : 'rgba(255,255,255,0.3)' }}
        >
          <span>Acceder al Templo</span>
          <svg
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </a>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()
  const greeting = getGreeting()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      // Prefer name from questionnaire/profile, fallback to Google name
      let resolvedName: string | null = null
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        resolvedName = profile?.full_name || null

        if (!resolvedName && user.email) {
          const { data: waitlist } = await supabase
            .from('waitlist')
            .select('name')
            .eq('email', user.email)
            .maybeSingle()
          resolvedName = waitlist?.name || null
        }
      } catch (e) {
        console.error('Name resolve error:', e)
      }

      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null
      setDisplayName(getPreferredName(resolvedName || googleName, user.email))
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
            <div className="absolute inset-2 w-10 h-10 rounded-full border border-transparent border-t-white/30 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white/40 text-sm font-light tracking-wide">Cargando...</p>
        </div>
      </div>
    )
  }

  const firstName = displayName || getFirstName(user?.email || '')

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050310]">

      {/* ── Fondo deband premium ──────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Radials */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 110% 80% at 10% 15%, rgba(59,130,246,0.13) 0%, rgba(37,99,235,0.05) 40%, transparent 70%),
            radial-gradient(ellipse 100% 80% at 90% 80%, rgba(109,40,217,0.11) 0%, rgba(88,28,135,0.04) 40%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 50% 5%,  rgba(139,92,246,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 70%)
          `
        }} />
        {/* Noise dithering anti-banding */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.022, mixBlendMode: 'overlay',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{
        background: 'linear-gradient(180deg, rgba(5,3,16,0.92) 0%, rgba(5,3,16,0.75) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Shimmer bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/este_logo.ico" alt="Portal Culture" width={36} height={36} className="w-8 h-8 md:w-9 md:h-9" priority />
            <span className="text-base md:text-lg font-semibold text-white tracking-tight">Portal Culture</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Online indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs text-white/35 truncate max-w-[130px]">{user?.email}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-xs font-medium text-white/50 hover:text-white/80 rounded-xl transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14 overflow-x-hidden">

        {/* ── Welcome ─────────────────────────────────────────── */}
        <div className="mb-12 md:mb-16">
          {/* Greeting pill — minimalista */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-sm">{greeting.emoji}</span>
            <span className="text-xs text-white/40 font-light">{greeting.text}</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-xs text-white/55 font-medium">{firstName}</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Tu portal al crecimiento
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/35 max-w-xl leading-relaxed">
            Accede a los 5 Templos, conecta con la comunidad y transforma tu vida con NOVA.
          </p>
        </div>

        {/* ── Discord Card ──────────────────────────────────────── */}
        <div className="mb-10">
          <a
            href="https://whop.com/portalculture/elaccesogratisparaportalculture/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block"
          >
            {/* Indigo glow */}
            <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <div
              className="relative rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-500"
              style={{
                background: 'linear-gradient(145deg, rgba(10,7,22,0.97) 0%, rgba(6,4,14,0.99) 100%)',
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Shimmer top */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

              <div className="flex items-start justify-between mb-5">
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <svg className="w-7 h-7 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group-hover:bg-white/[0.05]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xs text-white/35 group-hover:text-white/60 transition-colors">Unirse</span>
                  <svg className="w-3.5 h-3.5 text-white/35 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Comunidad Discord</h3>
              <p className="text-sm md:text-base text-white/35 leading-relaxed">
                Conecta con otros miembros, participa en desafíos semanales y comparte tu progreso.
              </p>
            </div>
          </a>
        </div>

        {/* ── Los 5 Templos ─────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Los 5 Templos</h3>
              <p className="text-xs text-white/25 tracking-wide">Tu camino al crecimiento</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs text-white/25">5 módulos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {courses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="pt-8 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-4">
          <p className="text-white/15 text-xs">© 2026 Portal Culture · Todos los derechos reservados</p>
          <div className="flex items-center gap-4">
            <a href="/terminos" className="text-xs text-white/15 hover:text-white/30 transition-colors">Términos</a>
            <a href="/privacidad" className="text-xs text-white/15 hover:text-white/30 transition-colors">Privacidad</a>
          </div>
        </div>

      </main>

      {/* ── AI Coach Widget ───────────────────────────────────── */}
      <AICoach />

    </div>
  )
}
