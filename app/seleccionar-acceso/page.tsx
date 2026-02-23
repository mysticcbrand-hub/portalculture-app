'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cardGlow, setCardGlow] = useState<{ x: number; y: number }[]>([
    { x: 50, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 50 }
  ])
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setCardGlow(prev => {
      const next = [...prev]
      next[index] = { x, y }
      return next
    })
  }, [])

  const handleFastPass = () => {
    window.location.href = 'https://whop.com/portalculture/acceso-inmediato'
  }

  const handleWaitlist = () => {
    router.push('/cuestionario')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
        </div>
      </div>
    )
  }

  // Card config
  const cards = [
    {
      index: 0,
      tag: 'Acceso Inmediato',
      tagColor: '#FF4444',
      price: '7€',
      priceLabel: 'pago único',
      accent: 'red',
      // gradient border colors
      borderFrom: 'rgba(239,68,68,0.6)',
      borderTo: 'rgba(220,38,38,0.2)',
      glowColor: 'rgba(239,68,68,0.15)',
      glowHover: 'rgba(239,68,68,0.28)',
      badgeBg: 'rgba(239,68,68,0.12)',
      badgeBorder: 'rgba(239,68,68,0.3)',
      badgeText: '#FF6B6B',
      btnFrom: '#DC2626',
      btnTo: '#991B1B',
      btnGlow: 'rgba(220,38,38,0.45)',
      isPrimary: true,
      badge: '⚡ Más popular',
      features: [
        'Acceso completo inmediato',
        'Sin espera ni aprobación',
        '5 Templos desbloqueados',
        'NOVA AI Coach ilimitado',
        'Discord exclusivo',
        'Actualizaciones de por vida',
      ],
      featureColor: '#FCA5A5',
      checkColor: '#FF4444',
      cta: 'Entrar ahora — 7€',
      onClick: handleFastPass,
    },
    {
      index: 1,
      tag: 'Lista de Espera',
      tagColor: '#3B82F6',
      price: 'Gratis',
      priceLabel: 'Tras aprobación manual',
      accent: 'blue',
      borderFrom: 'rgba(59,130,246,0.4)',
      borderTo: 'rgba(37,99,235,0.1)',
      glowColor: 'rgba(59,130,246,0.08)',
      glowHover: 'rgba(59,130,246,0.18)',
      badgeBg: 'rgba(59,130,246,0.1)',
      badgeBorder: 'rgba(59,130,246,0.25)',
      badgeText: '#93C5FD',
      btnFrom: '#2563EB',
      btnTo: '#1D4ED8',
      btnGlow: 'rgba(37,99,235,0.35)',
      isPrimary: false,
      badge: null,
      features: [
        'Aprobación con cuestionario',
        'Templos progresivos',
        'NOVA AI Coach (10 msg/día)',
        'Discord exclusivo',
      ],
      featureColor: '#93C5FD',
      checkColor: '#3B82F6',
      cta: 'Continuar gratis',
      onClick: handleWaitlist,
    },
  ]

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden" style={{ backgroundColor: '#000000' }}>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 group"
        aria-label="Cerrar sesión"
      >
        <div className="relative px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 hover:scale-105 active:scale-95">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors hidden sm:inline">Cerrar sesión</span>
          </div>
        </div>
      </button>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 70% 60% at 20% 35%, rgba(220,38,38,0.12) 0%, transparent 65%),
          radial-gradient(ellipse 60% 55% at 80% 65%, rgba(37,99,235,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 80% 50% at 50% 10%, rgba(109,40,217,0.08) 0%, transparent 65%)
        `
      }} />

      {/* Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
        mixBlendMode: 'overlay',
      }} />

      {/* Header */}
      <div className="relative z-10 text-center mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium tracking-widest uppercase"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Bienvenido a<br />
          <span style={{ background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Portal Culture
          </span>
        </h1>
        <p className="text-white/40 text-sm sm:text-base max-w-md mx-auto">
          Elige cómo quieres empezar tu transformación
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col md:flex-row gap-4 md:gap-5 items-stretch">
        {cards.map((card) => {
          const isHovered = hoveredCard === card.index
          const glow = cardGlow[card.index]

          return (
            <div
              key={card.index}
              ref={el => { cardRefs.current[card.index] = el }}
              className="relative flex-1 rounded-3xl cursor-pointer transition-all duration-500"
              style={{
                transform: isHovered
                  ? card.isPrimary ? 'translateY(-6px) scale(1.02)' : 'translateY(-3px) scale(1.01)'
                  : card.isPrimary ? 'translateY(-2px) scale(1.005)' : 'translateY(0) scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={() => setHoveredCard(card.index)}
              onMouseLeave={() => setHoveredCard(null)}
              onMouseMove={(e) => handleMouseMove(e, card.index)}
            >
              {/* Outer glow */}
              <div className="absolute -inset-[1px] rounded-3xl transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at ${glow.x}% ${glow.y}%, ${isHovered ? card.glowHover : card.glowColor} 0%, transparent 70%)`,
                  filter: 'blur(12px)',
                  opacity: isHovered ? 1 : card.isPrimary ? 0.6 : 0.3,
                }} />

              {/* Gradient border */}
              <div className="absolute -inset-[1px] rounded-3xl pointer-events-none transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${card.borderFrom}, ${card.borderTo}, transparent)`,
                  opacity: isHovered ? 1 : card.isPrimary ? 0.7 : 0.35,
                  padding: '1px',
                }} />

              {/* Card body */}
              <div className="relative rounded-3xl p-6 sm:p-8 h-full flex flex-col overflow-hidden"
                style={{
                  background: isHovered
                    ? `radial-gradient(ellipse at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.6) 100%)`
                    : 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.55) 100%)',
                  backdropFilter: 'blur(24px) saturate(140%)',
                  border: `1px solid ${isHovered ? card.borderFrom : 'rgba(255,255,255,0.07)'}`,
                  transition: 'background 0.4s ease, border-color 0.4s ease',
                }}>

                {/* Shimmer top */}
                <div className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.borderFrom}, transparent)`, opacity: isHovered ? 0.8 : card.isPrimary ? 0.5 : 0.2 }} />

                {/* Badge popular */}
                {card.badge && (
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                      style={{ background: card.badgeBg, border: `1px solid ${card.badgeBorder}`, color: card.badgeText }}>
                      {card.badge}
                    </div>
                  </div>
                )}

                {/* Tag */}
                <div className="inline-flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full" style={{ background: card.tagColor }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: card.tagColor }}>
                    {card.tag}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl sm:text-6xl font-bold text-white">{card.price}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{card.priceLabel}</p>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] mb-6" style={{ background: `linear-gradient(90deg, ${card.borderFrom}, transparent)`, opacity: 0.3 }} />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {card.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: `${card.checkColor}20`, border: `1px solid ${card.checkColor}40` }}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke={card.checkColor} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={card.onClick}
                  className="relative w-full py-4 rounded-2xl text-sm font-semibold text-white overflow-hidden group/btn"
                  style={{
                    background: `linear-gradient(135deg, ${card.btnFrom}, ${card.btnTo})`,
                    boxShadow: isHovered
                      ? `0 8px 32px ${card.btnGlow}, 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
                      : `0 4px 16px ${card.btnGlow.replace('0.45', '0.25').replace('0.35', '0.2')}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  {/* Shimmer sweep on hover */}
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                      transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
                      transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {card.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                      transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                      transition: 'transform 0.3s ease',
                    }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>

                {/* Footer note for paid */}
                {card.isPrimary && (
                  <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Pago seguro vía Whop · Sin suscripción
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom trust */}
      <div className="relative z-10 mt-8 md:mt-10 flex items-center gap-6 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pago seguro
        </span>
        <span className="w-[1px] h-3 bg-white/10" />
        <span>Sin compromisos</span>
        <span className="w-[1px] h-3 bg-white/10" />
        <span>Acceso inmediato</span>
      </div>

    </div>
  )
}
