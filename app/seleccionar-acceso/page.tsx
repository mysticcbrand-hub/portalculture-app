'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface CardTransform {
  rotateX: number
  rotateY: number
  glowX: number
  glowY: number
}

const DEFAULT_TRANSFORM: CardTransform = { rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 }

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null])
  const [transforms, setTransforms] = useState<CardTransform[]>([DEFAULT_TRANSFORM, DEFAULT_TRANSFORM])
  const rafRef = useRef<number | null>(null)
  
  // Mobile shuffle state
  const [shuffling, setShuffling] = useState(false)
  const [showPaid, setShowPaid] = useState(true)
  
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

  // Premium shuffle animation
  const handleShuffle = useCallback((type: 'paid' | 'free') => {
    if (shuffling) return
    setShuffling(true)
    
    let count = 0
    const maxShuffles = 6
    
    const shuffle = () => {
      count++
      setShowPaid(prev => !prev)
      
      if (count < maxShuffles) {
        setTimeout(shuffle, 100)
      } else {
        setShuffling(false)
        if (type === 'paid') {
          window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')
        } else {
          router.push('/cuestionario')
        }
      }
    }
    
    setTimeout(shuffle, 100)
  }, [shuffling, router])

  const handleFastPass = () => handleShuffle('paid')
  const handleWaitlist = () => handleShuffle('free')
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRefs.current[index]
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const intensity = index === 0 ? 10 : 6
      const rotateX = ((y - cy) / cy) * -intensity
      const rotateY = ((x - cx) / cx) * intensity
      const glowX = (x / rect.width) * 100
      const glowY = (y / rect.height) * 100
      setTransforms(prev => {
        const next = [...prev]
        next[index] = { rotateX, rotateY, glowX, glowY }
        return next
      })
    })
  }, [])

  const handleMouseLeave = useCallback((index: number) => {
    setHoveredCard(null)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setTransforms(prev => {
        const next = [...prev]
        next[index] = DEFAULT_TRANSFORM
        return next
      })
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-black">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 hidden md:block" style={{
          background: `
            radial-gradient(ellipse 90% 75% at 10% 25%, rgba(220,38,38,0.28) 0%, rgba(185,28,28,0.10) 40%, transparent 70%),
            radial-gradient(ellipse 80% 70% at 90% 75%, rgba(37,99,235,0.22) 0%, rgba(29,78,216,0.08) 40%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 55%)
          `
        }} />
        <div className="absolute inset-0 md:hidden" style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 20%, rgba(139,92,246,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 50% 90%, rgba(37,99,235,0.15) 0%, transparent 40%)
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
          mixBlendMode: 'overlay',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)'
        }} />
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 group">
        <div className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.08] rounded-full flex items-center gap-2">
          <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </button>

      {/* Header */}
      <div className="relative z-10 text-center mb-4 md:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 text-[11px] font-medium tracking-widest uppercase"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          <span style={{
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Portal Culture
          </span>
        </h1>
      </div>

      {/* MOBILE: Card Stack */}
      <div className="relative z-10 w-full max-w-[300px] md:hidden">
        
        {/* Card Container with Shuffle */}
        <div className="relative h-[340px]">
          
          {/* Card FREE (Behind) */}
          <div 
            className="absolute left-0 right-0 top-2 rounded-3xl overflow-hidden"
            style={{
              transform: `scale(${shuffling ? (showPaid ? 0.82 : 1) : (showPaid ? 0.85 : 1)}) translateY(${shuffling ? (showPaid ? 18 : 0) : (showPaid ? 15 : 0)}px)`,
              opacity: shuffling ? (showPaid ? 0.3 : 0.9) : (showPaid ? 0.5 : 1),
              filter: shuffling ? 'blur(2px)' : (showPaid ? 'blur(1px)' : 'blur(0px)'),
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: showPaid ? 1 : 10,
            }}
          >
            <div 
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(165deg, rgba(37,99,235,0.08) 0%, rgba(0,0,0,0.92) 60%)',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: '0 18px 35px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Lista de Espera</span>
                </div>
                <div className="text-3xl font-bold text-white/80 mb-1">Gratis</div>
                <p className="text-[9px] text-white/30 mb-3">tras aprobación</p>
                
                <div className="w-full h-px mb-3 bg-gradient-to-r from-blue-500/30 to-transparent" />
                
                <div className="space-y-1.5 flex-1">
                  <p className="text-[10px] text-white/45">✓ Aprobación manual</p>
                  <p className="text-[10px] text-white/45">✓ Templos progresivos</p>
                  <p className="text-[10px] text-white/45">✓ NOVA 10 msg/día</p>
                </div>

                <button
                  onClick={handleWaitlist}
                  disabled={shuffling}
                  className="w-full py-2.5 rounded-xl text-[11px] font-semibold mt-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.7) 0%, rgba(29,78,216,0.6) 100%)',
                    border: '1px solid rgba(59,130,246,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 15px rgba(37,99,235,0.25)',
                    opacity: shuffling ? 0.5 : 1,
                  }}
                >
                  {shuffling ? '...' : 'Solicitar Gratis'}
                </button>
              </div>
            </div>
          </div>

          {/* Card PAID (Front) */}
          <div 
            className="absolute left-0 right-0 top-0 rounded-3xl overflow-hidden"
            style={{
              transform: `scale(${shuffling ? (showPaid ? 1 : 0.88) : (showPaid ? 1 : 0.92)}) translateY(${shuffling ? (showPaid ? 0 : 12) : (showPaid ? 0 : 12)}px)`,
              opacity: shuffling ? (showPaid ? 0.9 : 0.4) : (showPaid ? 1 : 0.6),
              filter: shuffling ? 'blur(0px)' : (showPaid ? 'blur(0px)' : 'blur(1px)'),
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: showPaid ? 10 : 1,
            }}
          >
            <div 
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(165deg, rgba(220,38,38,0.1) 0%, rgba(0,0,0,0.9) 60%)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(220,38,38,0.15)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              
              <div className="absolute top-3 right-3 z-10">
                <div className="px-2.5 py-1 rounded-full text-[8px] font-semibold"
                  style={{ background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(239,68,68,0.45)', color: '#FCA5A5' }}>
                  ⚡ Popular
                </div>
              </div>

              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Acceso</span>
                </div>
                <div className="text-3.5xl font-bold text-white mb-1">17€</div>
                <p className="text-[9px] text-white/30 mb-3">pago único</p>
                
                <div className="w-full h-px mb-3 bg-gradient-to-r from-red-500/40 to-transparent" />
                
                <div className="space-y-1.5 flex-1">
                  <p className="text-[10px] text-white/65 flex items-center gap-1.5"><span className="text-green-400">✓</span> Acceso inmediato</p>
                  <p className="text-[10px] text-white/65 flex items-center gap-1.5"><span className="text-green-400">✓</span> 5 Templos</p>
                  <p className="text-[10px] text-white/65 flex items-center gap-1.5"><span className="text-green-400">✓</span> NOVA ilimitado</p>
                  <p className="text-[10px] text-white/65 flex items-center gap-1.5"><span className="text-green-400">✓</span> Discord</p>
                </div>

                <button
                  onClick={handleFastPass}
                  disabled={shuffling}
                  className="w-full py-2.5 rounded-xl text-[11px] font-semibold text-white mt-2"
                  style={{
                    background: shuffling
                      ? 'rgba(220,38,38,0.6)'
                      : 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
                    opacity: shuffling ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {shuffling ? '...' : 'Acceso 17€'}
                </button>
              </div>
            </div>
          </div>

        </div>

        <p className="text-center text-white/30 text-[9px] mt-4">
          {shuffling ? 'Eligiendo...' : 'Toca para elegir'}
        </p>
      </div>

      {/* DESKTOP: Cards */}
      <div className="relative z-10 w-full max-w-3xl hidden md:flex flex-row gap-5 items-stretch">

        {/* Card 0 - PAID */}
        <div
          ref={el => { cardRefs.current[0] = el }}
          className="relative flex-1 cursor-pointer"
          onClick={handleFastPass}
          style={{
            transform: `perspective(1000px) rotateX(${transforms[0].rotateX}deg) rotateY(${transforms[0].rotateY}deg) translateY(${hoveredCard === 0 ? '-8px' : '-3px'}) scale(${hoveredCard === 0 ? 1.025 : 1.008})`,
            transition: hoveredCard === 0 ? 'transform 0.12s' : 'transform 0.55s cubic-bezier(0.16,1,0.3,1)',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => handleMouseLeave(0)}
          onMouseMove={(e) => handleMouseMove(e, 0)}
        >
          <div className="absolute -inset-3 rounded-[36px] pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at ${transforms[0].glowX}% ${transforms[0].glowY}%, rgba(220,38,38,${hoveredCard === 0 ? '0.32' : '0.16'}) 0%, rgba(185,28,28,0.06) 50%, transparent 70%)`,
              filter: 'blur(20px)',
            }} />
          <div className="absolute -inset-[1px] rounded-3xl pointer-events-none"
            style={{
              background: `linear-gradient(135deg, rgba(239,68,68,${hoveredCard === 0 ? '0.85' : '0.55'}) 0%, rgba(185,28,28,0.3) 40%, rgba(120,0,0,0.1) 100%)`,
            }} />
          <div className="relative rounded-3xl p-6 sm:p-8 h-full flex flex-col overflow-hidden"
            style={{
              background: hoveredCard === 0
                ? `radial-gradient(ellipse at ${transforms[0].glowX}% ${transforms[0].glowY}%, rgba(220,38,38,0.09) 0%, rgba(0,0,0,0.75) 60%)`
                : 'linear-gradient(160deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.9) 100%)',
              border: `1px solid rgba(239,68,68,${hoveredCard === 0 ? '0.35' : '0.15'})`,
            }}>
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5' }}>
                ⚡ Más popular
              </div>
            </div>
            <div className="inline-flex items-center gap-2 mb-5 mt-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-red-400">Acceso Inmediato</span>
            </div>
            <div className="mb-6">
              <span className="text-5xl sm:text-6xl font-bold text-white">17€</span>
              <p className="text-sm text-white/30 mt-1">pago único · sin suscripción</p>
            </div>
            <div className="w-full h-[1px] mb-6 bg-gradient-to-r from-red-500/40 to-transparent" />
            <ul className="space-y-3 mb-auto flex-1">
              {['Acceso completo inmediato', 'Sin espera', '5 Templos', 'NOVA ilimitado', 'Discord'].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/40">
                    <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/75">{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={handleFastPass} className="w-full py-4 rounded-2xl text-sm font-semibold text-white mt-8 bg-gradient-to-r from-red-600 to-red-800 hover:shadow-lg hover:shadow-red-500/30">
              Entrar ahora →
            </button>
            <p className="text-center text-[11px] mt-3 text-white/20">Pago seguro vía Whop</p>
          </div>
        </div>

        {/* Card 1 - FREE */}
        <div
          ref={el => { cardRefs.current[1] = el }}
          className="relative flex-1 cursor-pointer"
          onClick={handleWaitlist}
          style={{
            transform: `perspective(1000px) rotateX(${transforms[1].rotateX}deg) rotateY(${transforms[1].rotateY}deg) translateY(${hoveredCard === 1 ? '-4px' : '0px'}) scale(${hoveredCard === 1 ? 1.01 : 1})`,
            transition: hoveredCard === 1 ? 'transform 0.12s' : 'transform 0.55s cubic-bezier(0.16,1,0.3,1)',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => handleMouseLeave(1)}
          onMouseMove={(e) => handleMouseMove(e, 1)}
        >
          <div className="absolute -inset-3 rounded-[36px] pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at ${transforms[1].glowX}% ${transforms[1].glowY}%, rgba(37,99,235,${hoveredCard === 1 ? '0.18' : '0.07'}) 0%, transparent 70%)`,
              filter: 'blur(18px)',
            }} />
          <div className="absolute -inset-[1px] rounded-3xl pointer-events-none"
            style={{
              background: `linear-gradient(135deg, rgba(59,130,246,${hoveredCard === 1 ? '0.45' : '0.2'}) 0%, rgba(37,99,235,0.1) 50%, transparent 100%)`,
            }} />
          <div className="relative rounded-3xl p-6 sm:p-8 h-full flex flex-col overflow-hidden"
            style={{
              background: hoveredCard === 1
                ? `radial-gradient(ellipse at ${transforms[1].glowX}% ${transforms[1].glowY}%, rgba(37,99,235,0.06) 0%, rgba(0,0,0,0.82) 60%)`
                : 'linear-gradient(160deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.85) 100%)',
              border: `1px solid rgba(59,130,246,${hoveredCard === 1 ? '0.2' : '0.08'})`,
            }}>
            <div className="inline-flex items-center gap-2 mb-5 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Lista de Espera</span>
            </div>
            <div className="mb-6">
              <span className="text-5xl sm:text-6xl font-bold text-white/80">Gratis</span>
              <p className="text-sm text-white/25 mt-1">Tras aprobación manual</p>
            </div>
            <div className="w-full h-[1px] mb-6 bg-gradient-to-r from-blue-500/25 to-transparent" />
            <ul className="space-y-3 mb-auto flex-1">
              {['Aprobación con cuestionario', 'Templos progresivos', 'NOVA 10 msg/día', 'Discord'].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-500/15 border border-blue-500/25">
                    <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/50">{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={handleWaitlist} className="w-full py-4 rounded-2xl text-sm font-semibold mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/30 text-white">
              Continuar gratis →
            </button>
          </div>
        </div>

      </div>

      {/* Trust bar */}
      <div className="relative z-10 mt-8 md:mt-10 flex items-center gap-5 text-[11px] text-white/20">
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Pago seguro
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span>Sin compromisos</span>
      </div>

    </div>
  )
}
