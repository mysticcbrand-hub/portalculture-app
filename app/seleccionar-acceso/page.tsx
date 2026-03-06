'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

const CARD_GAP = 280
const DEPTH_SCALE = 0.88
const DEPTH_ROTATE = 8
const DEPTH_Z = -80
const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 0.4

const BACKGROUNDS = [
  'radial-gradient(ellipse at 40% 60%, rgba(255,160,60,0.15) 0%, transparent 60%)',
  'radial-gradient(ellipse at 60% 40%, rgba(100,160,255,0.15) 0%, transparent 60%)',
]

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  
  const dragStartX = useRef(0)
  const dragStartTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
      setTimeout(() => setHasEntered(true), 100)
    }
    getUser()
  }, [router, supabase])

  const getCardTransform = useCallback((cardIndex: number) => {
    const position = cardIndex - activeIndex
    const dragProgress = typeof window !== 'undefined' ? dragX / window.innerWidth : 0
    const effectivePosition = position - dragProgress

    const recessionFactor = Math.min(Math.abs(effectivePosition), 1)

    return {
      translateX: effectivePosition * CARD_GAP,
      translateZ: -recessionFactor * Math.abs(DEPTH_Z),
      rotateY: effectivePosition * DEPTH_ROTATE,
      scale: 1 - recessionFactor * (1 - DEPTH_SCALE),
      opacity: 1 - recessionFactor * 0.35,
      zIndex: Math.round(10 - Math.abs(effectivePosition) * 10),
    }
  }, [activeIndex, dragX])

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartTime.current = Date.now()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const delta = e.clientX - dragStartX.current
    
    const isAtEdge = 
      (activeIndex === 0 && delta > 0) || 
      (activeIndex === 1 && delta < 0)
    
    setDragX(isAtEdge ? delta * 0.2 : delta)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const velocity = Math.abs(dragX) / Math.max(Date.now() - dragStartTime.current, 1)
    const shouldSwipe = Math.abs(dragX) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD

    if (shouldSwipe) {
      const direction = dragX < 0 ? 1 : -1
      const nextIndex = activeIndex + direction
      if (nextIndex >= 0 && nextIndex <= 1) {
        setActiveIndex(nextIndex)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(8)
        }
      }
    }
    
    setDragX(0)
    setIsDragging(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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

  const cards = [
    {
      type: 'paid',
      title: 'Acceso',
      price: '17€',
      subtitle: 'pago único',
      features: ['✓ Acceso inmediato', '✓ 5 Templos', '✓ NOVA ilimitado', '✓ Discord exclusivo'],
      button: 'Acceso 17€ →',
      action: () => window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer'),
    },
    {
      type: 'free',
      title: 'Lista de Espera',
      price: 'Gratis',
      subtitle: 'tras aprobación manual',
      features: ['✓ Aprobación manual', '✓ Templos progresivos', '✓ NOVA 10 msg/día', '✓ Discord exclusivo'],
      button: 'Solicitar Gratis',
      action: () => router.push('/cuestionario'),
    }
  ]

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
      
      {/* Ambient Background */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        animate={{ background: BACKGROUNDS[activeIndex] }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{
          background: `#000000`,
        }}
      />
      
      {/* Mobile Background Layers */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 8%, rgba(139,92,246,0.35) 0%, transparent 50%),
              radial-gradient(ellipse 90% 60% at 50% 95%, ${activeIndex === 0 ? 'rgba(255,180,80,0.12)' : 'rgba(100,160,255,0.12)'} 0%, transparent 45%),
              #000000
            `,
          }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          opacity: 0.035,
          mixBlendMode: 'overlay',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="fixed top-4 right-4 z-50">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>

      {/* Header */}
      <div className="relative z-10 text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Portal Culture</h1>
      </div>

      {/* MOBILE: Physics-Based Card Carousel */}
      <div className="relative z-10 w-full max-w-[340px] md:hidden">
        
        {/* Scene Container */}
        <div 
          ref={containerRef}
          className="carousel-scene"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div 
            className="carousel-track"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d',
              height: '420px',
            }}
          >
            <AnimatePresence mode="popLayout">
              {cards.map((card, index) => {
                const transform = getCardTransform(index)
                const isActive = index === activeIndex
                
                return (
                  <motion.div
                    key={card.type}
                    initial={hasEntered ? false : { y: 40, opacity: 0, scale: 0.94 }}
                    animate={hasEntered ? {
                      x: transform.translateX,
                      scale: transform.scale,
                      opacity: transform.opacity,
                      rotateY: transform.rotateY,
                    } : { y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 36,
                      mass: 1,
                    }}
                    style={{
                      position: 'absolute',
                      width: '300px',
                      minHeight: '380px',
                      padding: '36px 28px',
                      borderRadius: '28px',
                      zIndex: transform.zIndex,
                      transformStyle: 'preserve-3d',
                      cursor: 'pointer',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'none',
                    }}
                    className={`access-card access-card--${index === 0 ? 'option-1' : 'option-2'}`}
                  >
                    {/* Frosted Glass Base */}
                    <div 
                      className="absolute inset-0 rounded-[28px]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(32px) saturate(180%) brightness(1.1)',
                        WebkitBackdropFilter: 'blur(32px) saturate(180%) brightness(1.1)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: `
                          inset 0 1.5px 0 rgba(255, 255, 255, 0.25),
                          inset 0 -1px 0 rgba(255, 255, 255, 0.06),
                          0 24px 64px rgba(0, 0, 0, 0.35),
                          0 8px 24px rgba(0, 0, 0, 0.2)
                        `,
                      }}
                    />
                    
                    {/* Identity Color Bleed */}
                    <div 
                      className="absolute inset-0 rounded-[28px] pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 100%, ${index === 0 ? 'rgba(255,180,80,0.12)' : 'rgba(100,160,255,0.12)'} 0%, transparent 70%)`,
                      }}
                    />
                    
                    {/* Top Shine */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-px rounded-t-[28px]"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col">
                      {/* Badge */}
                      {card.type === 'paid' && (
                        <div className="absolute top-0 right-0">
                          <div 
                            className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase"
                            style={{
                              background: 'rgba(255,180,80,0.2)',
                              border: '1px solid rgba(255,180,80,0.35)',
                              color: '#fed7aa',
                              boxShadow: '0 0 20px rgba(255,180,80,0.2)',
                            }}
                          >
                            ⚡ Popular
                          </div>
                        </div>
                      )}
                      
                      {/* Label */}
                      <div className="flex items-center gap-2 mb-4">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: index === 0 ? '#ffb450' : '#64a0ff',
                            boxShadow: `0 0 12px ${index === 0 ? 'rgba(255,180,80,0.6)' : 'rgba(100,160,255,0.6)'}`,
                          }}
                        />
                        <span 
                          className="text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: index === 0 ? '#ffb450' : '#64a0ff' }}
                        >
                          {card.title}
                        </span>
                      </div>
                      
                      {/* Price */}
                      <div className="text-[3.5rem] font-bold text-white mb-1 tracking-tight leading-none">
                        {card.price}
                      </div>
                      <p className="text-xs text-white/35 mb-5">{card.subtitle}</p>
                      
                      {/* Divider */}
                      <div className="w-full h-px mb-5 bg-gradient-to-r from-white/10 to-transparent" />
                      
                      {/* Features */}
                      <div className="flex-1 space-y-3">
                        {card.features.map((f, i) => (
                          <p key={i} className="text-xs text-white/60">{f}</p>
                        ))}
                      </div>

                      {/* CTA Button - Only visible on active card */}
                      <motion.button
                        onClick={card.action}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.95,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                        className="card-cta"
                        style={{
                          width: '100%',
                          height: '52px',
                          borderRadius: '14px',
                          border: 'none',
                          background: index === 0 
                            ? 'linear-gradient(135deg, #ffb450 0%, #f97316 100%)'
                            : 'linear-gradient(135deg, #64a0ff 0%, #3b82f6 100%)',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                          cursor: 'pointer',
                          marginTop: 'auto',
                          boxShadow: index === 0
                            ? '0 8px 25px rgba(255,180,80,0.3)'
                            : '0 8px 25px rgba(100,160,255,0.3)',
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => {
                          e.stopPropagation()
                          card.action()
                        }}
                      >
                        {card.button}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Pagination Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === activeIndex ? 24 : 8,
                opacity: i === activeIndex ? 1 : 0.35,
                background: i === activeIndex 
                  ? 'rgba(255,255,255,0.9)' 
                  : 'rgba(255,255,255,0.4)',
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 32,
              }}
              style={{
                height: 8,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
        
        {/* Swipe Hint */}
        <div className="flex justify-center items-center gap-2 mt-3 text-white/25 text-[10px]">
          <span className="animate-pulse opacity-50">←</span>
          <span>Desliza</span>
          <span className="animate-pulse opacity-50">→</span>
        </div>
      </div>

      {/* DESKTOP - Both cards side by side (unchanged) */}
      <div className="relative z-10 w-full max-w-5xl hidden md:flex gap-6 px-4">
        
        {/* PAID */}
        <div 
          className="flex-1 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.995]"
          style={{
            background: 'linear-gradient(160deg, rgba(153,27,27,0.85) 0%, rgba(69,10,10,0.92) 50%, rgba(20,5,5,0.95) 100%)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(239,68,68,0.3)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(220,38,38,0.12)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <div className="absolute top-6 right-6">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase bg-red-500/25 border border-red-500/45 text-red-300">⚡ Popular</span>
          </div>

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Acceso Inmediato</span>
            </div>
            
            <div className="text-6xl font-bold text-white mb-2">17€</div>
            <p className="text-sm text-white/40 mb-6">pago único · sin suscripción</p>
            
            <div className="w-full h-px mb-6 bg-gradient-to-r from-red-500/40 to-transparent" />
            
            <div className="space-y-3.5 mb-8">
              {['Acceso completo inmediato', 'Sin espera ni aprobación', '5 Templos desbloqueados', 'NOVA AI Coach ilimitado', 'Discord exclusivo'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/40">
                    <svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/70">{f}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')}
              className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 hover:shadow-lg hover:shadow-red-500/25 transition-all active:scale-[0.98]"
            >
              Entrar ahora →
            </button>
            <p className="text-center text-[11px] text-white/20 mt-4">Pago seguro vía Whop</p>
          </div>
        </div>

        {/* FREE */}
        <div 
          className="flex-1 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.995]"
          style={{
            background: 'linear-gradient(160deg, rgba(30,64,175,0.8) 0%, rgba(15,23,42,0.9) 50%, rgba(3,7,18,0.95) 100%)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(59,130,246,0.25)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 40px rgba(37,99,235,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Lista de Espera</span>
            </div>
            
            <div className="text-6xl font-bold text-white/85 mb-2">Gratis</div>
            <p className="text-sm text-white/30 mb-6">tras aprobación manual</p>
            
            <div className="w-full h-px mb-6 bg-gradient-to-r from-blue-500/30 to-transparent" />
            
            <div className="space-y-3.5 mb-8">
              {['Aprobación con cuestionario', 'Templos progresivos', 'NOVA AI (10 msg/día)', 'Discord exclusivo'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-500/15 border border-blue-500/25">
                    <svg className="w-2 h-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/50">{f}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => router.push('/cuestionario')}
              className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Continuar gratis →
            </button>
          </div>
        </div>

      </div>

      {/* Trust */}
      <div className="relative z-10 mt-8 flex items-center justify-center gap-4 text-white/25 text-[10px] flex-wrap px-4">
        <span className="flex items-center gap-1.5">✓ Pago seguro</span>
        <span className="w-px h-3 bg-white/10" />
        <span>✓ Sin compromisos</span>
        <span className="w-px h-3 bg-white/10" />
        <span>✓ Acceso inmediato</span>
      </div>

    </div>
  )
}
