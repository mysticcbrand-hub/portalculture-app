'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'

const CARD_GAP = 340
const DEPTH_SCALE = 0.84
const DEPTH_ROTATE = 8
const DEPTH_Z = -100
const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 0.4

const CARD_TINTS = [
  { top: 'rgba(255, 220, 140, 0.08)', bottom: 'rgba(255, 180, 80, 0.08)', accent: '#ffd700', glow: 'rgba(255, 200, 100, 0.15)' },
  { top: 'rgba(140, 180, 255, 0.06)', bottom: 'rgba(100, 160, 255, 0.08)', accent: '#64a0ff', glow: 'rgba(100, 160, 255, 0.12)' },
]

function useTilt(cardRef: React.RefObject<HTMLDivElement | null>) {
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false)

  const TILT_MAX = 8
  const LERP = 0.09

  const loop = useCallback(() => {
    const t = targetRef.current
    const c = currentRef.current

    currentRef.current = {
      x: c.x + (t.x - c.x) * LERP,
      y: c.y + (t.y - c.y) * LERP,
    }

    const settled =
      !activeRef.current &&
      Math.abs(currentRef.current.x) < 0.0015 &&
      Math.abs(currentRef.current.y) < 0.0015

    if (cardRef.current) {
      const rx = -currentRef.current.y * TILT_MAX
      const ry = currentRef.current.x * TILT_MAX
      const mag = Math.sqrt(
        currentRef.current.x ** 2 +
        currentRef.current.y ** 2
      )

      cardRef.current.style.transform =
        `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`

      const gx = (currentRef.current.x + 1) / 2 * 100
      const gy = (currentRef.current.y + 1) / 2 * 100
      cardRef.current.style.setProperty('--glare-x', `${gx.toFixed(1)}%`)
      cardRef.current.style.setProperty('--glare-y', `${gy.toFixed(1)}%`)
      cardRef.current.style.setProperty('--glare-o', `${(mag * 0.10).toFixed(4)}`)
      cardRef.current.style.setProperty('--tilt-shadow-o', `${(0.25 + mag * 0.20).toFixed(4)}`)
    }

    if (!settled) {
      rafRef.current = requestAnimationFrame(loop)
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = ''
        cardRef.current.style.setProperty('--glare-o', '0')
        cardRef.current.style.setProperty('--tilt-shadow-o', '0.25')
      }
    }
  }, [cardRef])

  const onEnter = useCallback(() => {
    activeRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const onLeave = useCallback(() => {
    activeRef.current = false
    targetRef.current = { x: 0, y: 0 }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [loop])

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    targetRef.current = {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: ((e.clientY - r.top) / r.height) * 2 - 1,
    }
  }, [cardRef])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return { onEnter, onLeave, onMove }
}

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  
  const springDragX = useSpring(dragX, {
    stiffness: 500,
    damping: 40,
    mass: 0.8,
  })
  
  const dragStartX = useRef(0)
  const dragStartTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const paidCardRef = useRef<HTMLDivElement>(null)
  const freeCardRef = useRef<HTMLDivElement>(null)
  const paidTilt = useTilt(paidCardRef)
  const freeTilt = useTilt(freeCardRef)
  
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
    const currentDragX = springDragX.get()
    const dragProgress = typeof window !== 'undefined' ? currentDragX / window.innerWidth : 0
    const effectivePosition = position - dragProgress

    const recessionFactor = Math.min(Math.abs(effectivePosition), 1)
    
    const swipeFactor = Math.abs(dragProgress)
    const shuffleScale = 1 - swipeFactor * 0.02
    const shuffleRotate = Math.sign(dragProgress) * swipeFactor * 2

    return {
      translateX: effectivePosition * CARD_GAP,
      translateZ: -recessionFactor * Math.abs(DEPTH_Z),
      rotateY: effectivePosition * DEPTH_ROTATE + shuffleRotate,
      scale: (1 - recessionFactor * (1 - DEPTH_SCALE)) * shuffleScale,
      opacity: 1 - recessionFactor * 0.3,
      zIndex: Math.round(10 - Math.abs(effectivePosition) * 10),
    }
  }, [activeIndex, springDragX])

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
    
    setDragX(isAtEdge ? delta * 0.15 : delta)
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
          navigator.vibrate(10)
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
        animate={{ 
          background: activeIndex === 0 
            ? 'radial-gradient(ellipse at 35% 55%, rgba(255, 200, 100, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 65% 45%, rgba(100, 160, 255, 0.06) 0%, transparent 50%)'
        }}
        transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
      />
      
      {/* Mobile Background Layers */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: `
              radial-gradient(ellipse 100% 70% at 50% 5%, rgba(139,92,246,0.25) 0%, transparent 45%),
              radial-gradient(ellipse 80% 50% at 50% 98%, ${activeIndex === 0 ? 'rgba(255, 200, 100, 0.08)' : 'rgba(100, 160, 255, 0.06)'} 0%, transparent 40%),
              #000000
            `,
          }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          opacity: 0.025,
          mixBlendMode: 'overlay',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="fixed top-4 right-4 z-50">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/8 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-white/40 text-[10px] uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Portal Culture</h1>
      </div>

      {/* MOBILE: Physics-Based Card Carousel */}
      <div className="relative z-10 w-full max-w-[340px] md:hidden">
        
        {/* Scene Container */}
        <div 
          ref={containerRef}
          className="carousel-scene"
          style={{
            perspective: '1400px',
            perspectiveOrigin: '50% 45%',
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
              height: '460px',
            }}
          >
            <AnimatePresence mode="popLayout">
              {cards.map((card, index) => {
                const transform = getCardTransform(index)
                const isActive = index === activeIndex
                const tint = CARD_TINTS[index]
                
                return (
                  <motion.div
                    key={card.type}
                    initial={hasEntered ? false : { y: 50, opacity: 0, scale: 0.92 }}
                    animate={hasEntered ? {
                      x: transform.translateX,
                      scale: transform.scale,
                      opacity: transform.opacity,
                      rotateY: transform.rotateY,
                    } : { y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 32,
                      mass: 1.1,
                    }}
                    style={{
                      position: 'absolute',
                      width: '300px',
                      minHeight: '440px',
                      padding: '40px 28px 36px',
                      borderRadius: '32px',
                      zIndex: transform.zIndex,
                      transformStyle: 'preserve-3d',
                      cursor: 'pointer',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'none',
                    }}
                  >
                    {/* Premium Frosted Glass */}
                    <div 
                      className="absolute inset-0 rounded-[32px]"
                      style={{
                        background: `linear-gradient(165deg, ${tint.top} 0%, rgba(255,255,255,0.03) 50%, ${tint.bottom} 100%)`,
                        backdropFilter: 'blur(36px) saturate(190%) brightness(1.08)',
                        WebkitBackdropFilter: 'blur(36px) saturate(190%) brightness(1.08)',
                        border: `1px solid rgba(255, 255, 255, 0.14)`,
                        boxShadow: `
                          inset 0 1px 0 rgba(255, 255, 255, 0.2),
                          inset 0 -0.5px 0 rgba(255, 255, 255, 0.05),
                          0 28px 72px rgba(0, 0, 0, 0.4),
                          0 12px 28px rgba(0, 0, 0, 0.25),
                          0 0 60px ${tint.glow}
                        `,
                      }}
                    />
                    
                    {/* Inner glow for depth */}
                    <div 
                      className="absolute inset-0 rounded-[32px] pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 0%, ${tint.top} 0%, transparent 60%)`,
                        opacity: 0.5,
                      }}
                    />
                    
                    {/* Bottom color bleed */}
                    <div 
                      className="absolute inset-0 rounded-[32px] pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 100%, ${tint.bottom} 0%, transparent 65%)`,
                      }}
                    />
                    
                    {/* Top Edge Shine */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-px rounded-t-[32px]"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col">
                      {/* Label */}
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div 
                          className="w-1.5 h-1.5 rounded-full"
                          animate={{ 
                            boxShadow: isActive ? `0 0 16px ${tint.accent}80` : 'none' 
                          }}
                          transition={{ duration: 0.3 }}
                          style={{
                            background: tint.accent,
                          }}
                        />
                        <span 
                          className="text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: `${tint.accent}cc` }}
                        >
                          {card.title}
                        </span>
                      </div>
                      
                      {/* Price */}
                      <motion.div 
                        className="text-[3.5rem] font-bold text-white mb-1 tracking-tight leading-none"
                        style={{ textShadow: `0 0 40px ${tint.glow}` }}
                      >
                        {card.price}
                      </motion.div>
                      <p className="text-xs text-white/30 mb-4">{card.subtitle}</p>
                      
                      {/* Divider */}
                      <div className="w-full h-px mb-4" style={{
                        background: `linear-gradient(90deg, transparent, ${tint.accent}15, transparent)`
                      }} />
                      
                      {/* Features */}
                      <div className="flex-1 space-y-2.5">
                        {card.features.map((f, i) => (
                          <p key={i} className="text-xs text-white/50">{f}</p>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <motion.div
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.96,
                          filter: isActive ? 'blur(0px)' : 'blur(8px)',
                          y: isActive ? 0 : 12,
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                        transition={{
                          opacity: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
                          filter: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                          y: { type: 'spring', stiffness: 350, damping: 30 },
                        }}
                        style={{ paddingTop: '24px' }}
                      >
                        <motion.button
                          onClick={card.action}
                          whileTap={{ scale: 0.96 }}
                          transition={{ duration: 0.1 }}
                          style={{
                            width: '100%',
                            height: '54px',
                            borderRadius: '16px',
                            border: `1px solid rgba(255, 255, 255, 0.2)`,
                            background: `linear-gradient(135deg, ${tint.accent}25, ${tint.accent}12)`,
                            backdropFilter: 'blur(20px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                            boxShadow: `
                              inset 0 1px 0 rgba(255, 255, 255, 0.25),
                              inset 0 -1px 0 rgba(255, 255, 255, 0.05),
                              0 6px 20px rgba(0, 0, 0, 0.2),
                              0 0 40px ${tint.glow}
                            `,
                            color: 'rgba(255, 255, 255, 0.92)',
                            fontSize: '15px',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => {
                            e.stopPropagation()
                            card.action()
                          }}
                        >
                          {card.button}
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Pagination Indicators */}
        <div className="flex justify-center gap-2.5 mt-2">
          {cards.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === activeIndex ? 28 : 8,
                opacity: i === activeIndex ? 1 : 0.25,
                background: i === activeIndex 
                  ? CARD_TINTS[i].accent 
                  : 'rgba(255,255,255,0.3)',
              }}
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 30,
              }}
              style={{
                height: 6,
                borderRadius: 3,
              }}
            />
          ))}
        </div>
        
        {/* Swipe Hint - Moved below cards, more subtle */}
        <motion.div 
          className="flex justify-center items-center gap-2 mt-6"
          animate={{ opacity: isDragging ? 0.15 : 0.35 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-white/40 text-[9px] tracking-widest uppercase">Desliza</span>
        </motion.div>
      </div>

      {/* DESKTOP - Premium Frosted Glass Cards */}
      <div className="relative z-10 w-full max-w-5xl hidden md:flex gap-8 px-4 items-stretch">
        
        {/* PAID - Premium Card */}
        <div style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}>
          <motion.div 
            ref={paidCardRef}
            className="flex-1 rounded-[32px] overflow-hidden cursor-pointer relative"
            style={{ 
              minHeight: '520px',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              boxShadow: '0 32px 80px -20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,var(--tilt-shadow-o, 0.25))',
              transition: 'box-shadow 0.25s ease',
            }}
            onMouseEnter={paidTilt.onEnter}
            onMouseLeave={paidTilt.onLeave}
            onMouseMove={paidTilt.onMove}
          >
            {/* Ambient glow */}
            <motion.div 
              className="absolute inset-0 rounded-[32px]"
              style={{
                background: 'radial-gradient(ellipse at 40% 0%, rgba(255, 200, 100, 0.1) 0%, transparent 50%)',
              }}
            />
            
            <div 
              className="relative h-full rounded-[32px] p-8 pt-12 flex flex-col"
              style={{
                background: 'linear-gradient(165deg, rgba(255, 220, 140, 0.06) 0%, rgba(255,255,255,0.02) 40%, rgba(255, 180, 80, 0.04) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 0 80px rgba(255, 200, 100, 0.08)
                `,
              }}
            >
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-[32px]" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,200,100,0.2), transparent)'
              }} />
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 12px rgba(255,215,0,0.5)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ffd700cc' }}>Acceso Inmediato</span>
              </div>
              
              <div className="text-6xl font-bold text-white mb-2" style={{ textShadow: '0 0 40px rgba(255,200,100,0.3)' }}>17€</div>
              <p className="text-sm text-white/35 mb-8">pago único · sin suscripción</p>
              
              <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)' }} />
              
              <div className="space-y-4 mb-8">
                {['Acceso completo inmediato', 'Sin espera ni aprobación', '5 Templos desbloqueados', 'NOVA AI Coach ilimitado', 'Discord exclusivo'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)' }}
                    >
                      <svg className="w-2.5 h-2.5" style={{ color: '#ffd700' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-white/70">{f}</span>
                  </div>
                ))}
              </div>

              <motion.button 
                onClick={() => window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,180,80,0.12))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.2),
                    0 8px 32px rgba(255,200,100,0.15),
                    0 2px 8px rgba(0,0,0,0.2)
                  `,
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                Entrar ahora →
              </motion.button>
              <p className="text-center text-[11px] text-white/15 mt-5">Pago seguro vía Whop</p>

              {/* Glare */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'hidden',
                mixBlendMode: 'screen',
                background: `radial-gradient(circle 110px at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255, var(--glare-o, 0)) 0%, rgba(255,255,255, calc(var(--glare-o,0) * 0.45)) 38%, rgba(255,255,255, calc(var(--glare-o,0) * 0.15)) 60%, rgba(255,255,255, 0) 100%)`,
              }}/>
            </div>
          </motion.div>
        </div>

        {/* FREE - Subtle Card */}
        <div style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}>
          <motion.div 
            ref={freeCardRef}
            className="flex-1 rounded-[32px] overflow-hidden cursor-pointer relative"
            style={{ 
              minHeight: '520px',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              boxShadow: '0 32px 80px -20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,var(--tilt-shadow-o, 0.25))',
              transition: 'box-shadow 0.25s ease',
            }}
            onMouseEnter={freeTilt.onEnter}
            onMouseLeave={freeTilt.onLeave}
            onMouseMove={freeTilt.onMove}
          >
            <motion.div 
              className="absolute inset-0 rounded-[32px]"
              style={{
                background: 'radial-gradient(ellipse at 60% 0%, rgba(100,160,255,0.06) 0%, transparent 50%)',
              }}
            />

            <div 
              className="relative h-full rounded-[32px] p-8 pt-12 flex flex-col"
              style={{
                background: 'linear-gradient(165deg, rgba(140,180,255,0.04) 0%, rgba(255,255,255,0.02) 40%, rgba(100,160,255,0.03) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.08),
                  0 0 60px rgba(100,160,255,0.04)
                `,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-[32px]" style={{
                background: 'linear-gradient(90deg, transparent, rgba(100,160,255,0.15), transparent)'
              }} />

              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ background: '#64a0ff', boxShadow: '0 0 12px rgba(100,160,255,0.4)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64a0ffcc' }}>Lista de Espera</span>
              </div>
              
              <div className="text-6xl font-bold text-white/80 mb-2">Gratis</div>
              <p className="text-sm text-white/25 mb-8">tras aprobación manual</p>
              
              <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(100,160,255,0.15), transparent)' }} />
              
              <div className="space-y-4 mb-8">
                {['Aprobación con cuestionario', 'Templos progresivos', 'NOVA AI (10 msg/día)', 'Discord exclusivo'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(100,160,255,0.08)', border: '1px solid rgba(100,160,255,0.15)' }}
                    >
                      <svg className="w-2.5 h-2.5" style={{ color: '#64a0ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-white/40">{f}</span>
                  </div>
                ))}
              </div>

              <motion.button 
                onClick={() => router.push('/cuestionario')}
                whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(100,160,255,0.15)' }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'linear-gradient(135deg, rgba(100,160,255,0.1), rgba(100,160,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    0 8px 32px rgba(100,160,255,0.08)
                  `,
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '15px',
                  fontWeight: 600,
                  marginTop: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                Continuar gratis →
              </motion.button>

              {/* Glare */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'hidden',
                mixBlendMode: 'screen',
                background: `radial-gradient(circle 110px at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255, var(--glare-o, 0)) 0%, rgba(255,255,255, calc(var(--glare-o,0) * 0.45)) 38%, rgba(255,255,255, calc(var(--glare-o,0) * 0.15)) 60%, rgba(255,255,255, 0) 100%)`,
              }}/>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Trust */}
      <div className="relative z-10 mt-10 flex items-center justify-center gap-5 text-white/20 text-[10px] flex-wrap px-4">
        <span className="flex items-center gap-1.5">✓ Pago seguro</span>
        <span className="w-px h-3 bg-white/8" />
        <span>✓ Sin compromisos</span>
        <span className="w-px h-3 bg-white/8" />
        <span>✓ Acceso inmediato</span>
      </div>

    </div>
  )
}
