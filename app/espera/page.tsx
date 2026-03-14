'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════════
// ACTIVITY DATA — 20+ items
// ═══════════════════════════════════════════════════════════════════

type ActivityType = 'member' | 'content' | 'coach'

interface ActivityItem {
  type: ActivityType
  text: string
  sub: string
}

const ACTIVITY_ITEMS: ActivityItem[] = [
  // MEMBER (green dot indicator)
  { type: 'member', text: 'Alejandro, 17', sub: 'terminó "Mentalidad de Élite"' },
  { type: 'member', text: 'Sara, 16', sub: 'completó su primera semana' },
  { type: 'member', text: 'Diego, 19', sub: '"por fin entiendo por qué no avanzaba"' },
  { type: 'member', text: 'Lucía, 18', sub: 'lleva 14 días en racha' },
  { type: 'member', text: 'Carlos, 17', sub: 'acaba de unirse desde Madrid' },
  { type: 'member', text: 'Martina, 16', sub: '"esto es lo que buscaba"' },
  { type: 'member', text: 'Pablo, 20', sub: 'completó 3 cursos este mes' },
  { type: 'member', text: 'Ana, 17', sub: 'su primer post tuvo 24 respuestas' },
  { type: 'member', text: 'Iván, 18', sub: 'referenciado por otro miembro' },
  { type: 'member', text: 'Elena, 16', sub: 'primera semana, ya nota diferencia' },

  // CONTENT (slash / indicator)
  { type: 'content', text: 'Nuevo ebook', sub: 'Productividad Profunda · 48 págs' },
  { type: 'content', text: 'Nuevo curso', sub: 'Comunicación de Alto Impacto' },
  { type: 'content', text: 'Sesión grupal', sub: 'Gestión del tiempo · hoy 20:00' },
  { type: 'content', text: 'Recurso nuevo', sub: 'Los 10 libros del coach IA' },
  { type: 'content', text: 'Masterclass', sub: 'Cómo aprender cualquier cosa' },

  // AI COACH (breathing circle indicator)
  { type: 'coach', text: 'Coach IA', sub: 'respondió 31 preguntas esta mañana' },
  { type: 'coach', text: 'Coach IA', sub: 'activo ahora · basado en +10 libros' },
  { type: 'coach', text: 'Coach IA', sub: 'nueva respuesta sobre productividad' },
  { type: 'coach', text: 'Coach IA', sub: '3 miembros consultaron en la última hora' },
  { type: 'coach', text: 'Coach IA', sub: 'respuesta sobre gestión del miedo' },
]

// ═══════════════════════════════════════════════════════════════════
// TIMESTAMP GENERATOR
// ═══════════════════════════════════════════════════════════════════

function generateFakeTimestamp() {
  const options = ['ahora', 'hace 1m', 'hace 2m', 'hace 3m', 'hace 5m', 'hace 7m']
  return options[Math.floor(Math.random() * options.length)]
}

// ═══════════════════════════════════════════════════════════════════
// INDICATORS
// ═══════════════════════════════════════════════════════════════════

function GreenPulsingDot() {
  return (
    <div style={{ position: 'relative', width: 8, height: 8, marginTop: 3 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(80, 220, 140, 0.9)' }} />
      <motion.div
        style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: 'rgba(80, 220, 140, 0.3)' }}
        animate={{ scale: [1, 1.9, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: Math.random() * 1 }}
      />
    </div>
  )
}

function SlashIndicator() {
  return (
    <div style={{ width: 8, height: 12, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 1.5, height: 12, background: 'rgba(160, 100, 255, 0.80)', transform: 'rotate(20deg)', borderRadius: 1, boxShadow: '0 0 6px rgba(160,100,255,0.5)' }} />
    </div>
  )
}

function BreathingCircle() {
  return (
    <motion.div
      style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid rgba(100, 180, 255, 0.75)', marginTop: 3 }}
      animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════
// FEED ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════

function FeedItem({ item }: { item: { id: number; data: ActivityItem; delay: number } }) {
  const indicators: Record<ActivityType, React.ReactNode> = {
    member: <GreenPulsingDot />,
    content: <SlashIndicator />,
    coach: <BreathingCircle />,
  }

  const accentColors: Record<ActivityType, string> = {
    member: 'rgba(80, 220, 140, 0.75)',
    content: 'rgba(160, 100, 255, 0.75)',
    coach: 'rgba(100, 180, 255, 0.75)',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 32, mass: 0.8 },
        opacity: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
        y: { type: 'spring', stiffness: 380, damping: 36, mass: 0.7 },
        filter: { duration: 0.3 },
      }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '10px 20px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.025)',
        border: '0.5px solid rgba(255,255,255,0.06)',
        marginBottom: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent line */}
      <div style={{
        position: 'absolute', left: 0, top: 8, bottom: 8, width: 2,
        borderRadius: 1,
        background: accentColors[item.data.type],
        boxShadow: `0 0 8px ${accentColors[item.data.type]}`,
      }} />

      {/* Indicator icon */}
      <div style={{ marginTop: 2, flexShrink: 0, marginLeft: 8 }}>
        {indicators[item.data.type]}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: 'rgba(255,255,255,0.82)',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {item.data.text}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 400,
          color: 'rgba(255,255,255,0.38)',
          letterSpacing: '-0.005em',
          lineHeight: 1.4,
          marginTop: 2,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {item.data.sub}
        </div>
      </div>

      {/* Timestamp */}
      <div style={{
        fontSize: 9, color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.04em',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        flexShrink: 0, marginTop: 2,
      }}>
        {generateFakeTimestamp()}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// GRAIN LAYER
// ═══════════════════════════════════════════════════════════════════

function GrainLayer() {
  return (
    <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.032, pointerEvents: 'none', mixBlendMode: 'screen', zIndex: 0 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 1 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PANEL COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function PanelHeader() {
  return (
    <>
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
        {/* Left: live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 8, height: 8 }}>
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(80, 220, 140, 1)' }}
            />
            <motion.div
              style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: 'rgba(80, 220, 140, 0.35)' }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: 'ui-monospace, "SF Mono", monospace' }}>
            En vivo
          </span>
        </div>

        {/* Right: portal culture label */}
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', fontFamily: 'ui-monospace, "SF Mono", monospace' }}>
          Portal Culture
        </span>
      </div>

      {/* Hairline divider */}
      <div style={{ width: '100%', height: '0.5px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
    </>
  )
}

function PanelFooter() {
  return (
    <div style={{ height: 48, flexShrink: 0, borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8 }}>
      {/* Three tiny avatar circles */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 20, height: 20, borderRadius: '50%',
          background: `rgba(${i === 0 ? '160,100,255' : i === 1 ? '100,180,255' : '80,220,140'}, 0.35)`,
          border: '1px solid rgba(255,255,255,0.12)',
          marginLeft: i > 0 ? -8 : 0,
        }} />
      ))}
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em', marginLeft: 6 }}>
        <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>847</span>
        {' '}miembros activos
      </span>
    </div>
  )
}

function PanelVignette() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, borderRadius: 'inherit',
      background: 'linear-gradient(180deg, rgba(14, 10, 28, 0.85) 0%, rgba(14, 10, 28, 0.000) 18%, rgba(14, 10, 28, 0.000) 75%, rgba(14, 10, 28, 0.70) 100%)',
    }} />
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function WaitingRoomPage() {
  const router = useRouter()
  const [visibleItems, setVisibleItems] = useState<{ id: number; data: ActivityItem; delay: number }[]>([])
  const indexRef = useRef(0)
  const itemIdRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize feed
  useEffect(() => {
    const initial = []
    for (let i = 0; i < 4; i++) {
      initial.push({
        id: itemIdRef.current++,
        data: ACTIVITY_ITEMS[i % ACTIVITY_ITEMS.length],
        delay: i * 0.15,
      })
      indexRef.current++
    }
    setVisibleItems(initial)

    const scheduleNext = () => {
      const delay = 2200 + Math.random() * 1600
      timerRef.current = setTimeout(() => {
        const next = ACTIVITY_ITEMS[indexRef.current % ACTIVITY_ITEMS.length]
        indexRef.current++
        setVisibleItems(prev => {
          const updated = [...prev, { id: itemIdRef.current++, data: next, delay: 0 }]
          return updated.slice(-6)
        })
        scheduleNext()
      }, delay)
    }

    timerRef.current = setTimeout(scheduleNext, 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleEnter = useCallback(() => {
    router.push('/seleccionar-acceso')
  }, [router])

  const maxVisible = isMobile ? 4 : 6

  return (
    <div style={{
      minHeight: '100dvh', width: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      background: `
        radial-gradient(ellipse 70% 55% at 50% 48%, rgba(110, 70, 200, 0.065) 0%, rgba(90, 50, 180, 0.038) 28%, rgba(70, 30, 160, 0.016) 52%, rgba(50, 10, 140, 0.000) 100%),
        radial-gradient(ellipse 100% 60% at 50% 100%, rgba(80, 40, 160, 0.055) 0%, rgba(60, 20, 140, 0.000) 60%),
        #08060f
      `,
    }}>
      {/* Grain overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen', zIndex: 0 }}
      >
        <GrainLayer />
      </motion.div>

      {/* Logo */}
      <motion.img
        src="/este_logo.ico"
        alt="Portal Culture"
        style={{
          position: 'absolute', top: 24, left: '50%',
          transform: 'translateX(-50%)',
          width: 32, height: 32,
          imageRendering: 'crisp-edges' as React.CSSProperties['imageRendering'],
          opacity: 0.7,
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
          zIndex: 10,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Center content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', width: '100%', maxWidth: 520,
        zIndex: 1,
      }}>

        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.30em' }}
          animate={{ opacity: 1, letterSpacing: '0.14em' }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          style={{
            fontSize: 10, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            textAlign: 'center', marginBottom: 16,
          }}
        >
          Portal Culture · En vivo
        </motion.p>

        {/* THE PANEL */}
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 32, scale: 0.97, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{
            type: 'spring', stiffness: 260, damping: 30, mass: 1.1,
            filter: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
            opacity: { duration: 0.4 },
          }}
          style={{
            width: 'min(480px, calc(100vw - 48px))',
            height: 'min(520px, calc(100vh - 200px))',
            borderRadius: 24,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(22, 16, 42, 0.88) 0%, rgba(14, 10, 28, 0.94) 100%)',
            backdropFilter: 'blur(48px) saturate(160%) brightness(0.92)',
            WebkitBackdropFilter: 'blur(48px) saturate(160%) brightness(0.92)',
            borderTop: '0.5px solid rgba(255, 255, 255, 0.18)',
            borderLeft: '0.5px solid rgba(255, 255, 255, 0.10)',
            borderRight: '0.5px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.04)',
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.12),
              0 4px 12px rgba(0, 0, 0, 0.30),
              0 16px 48px rgba(0, 0, 0, 0.45),
              0 40px 80px rgba(0, 0, 0, 0.35),
              0 0 120px rgba(100, 60, 200, 0.08)
            `,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <PanelHeader />

          {/* Activity Feed */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '12px 0' }}>
            <AnimatePresence mode="popLayout">
              {visibleItems.slice(-maxVisible).map((item) => (
                <FeedItem key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Vignette overlay */}
          <PanelVignette />

          {/* Footer */}
          <PanelFooter />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.65, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
          style={{
            fontSize: 22, fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.2,
            color: 'rgba(255,255,255,0.92)',
            textAlign: 'center', marginTop: 24,
            textWrap: 'balance',
          }}
        >
          Esto pasa cada día.
          <span style={{ color: 'rgba(255,255,255,0.40)' }}> Con o sin ti.</span>
        </motion.h2>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: 1.0, ease: [0.32, 0.72, 0, 1] }}
          whileHover={{
            scale: 1.03,
            boxShadow: `
              0 0 0 1px rgba(160,100,255,0.4),
              0 8px 32px rgba(120,60,220,0.45),
              0 20px 48px rgba(100,40,200,0.25)
            `,
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnter}
          style={{
            marginTop: 20,
            height: 52, padding: '0 36px',
            borderRadius: 14, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, rgba(150, 90, 255, 1.0) 0%, rgba(110, 55, 235, 1.0) 50%, rgba(90, 35, 215, 1.0) 100%)`,
            color: 'rgba(255,255,255,0.97)',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            fontFamily: 'inherit',
            WebkitFontSmoothing: 'antialiased',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.20),
              0 4px 16px rgba(120,60,220,0.40),
              0 2px 6px rgba(100,40,200,0.30)
            `,
            position: 'relative', overflow: 'hidden',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(105deg, rgba(255,255,255,0.000) 30%, rgba(255,255,255,0.120) 50%, rgba(255,255,255,0.000) 70%)`,
              translateX: '-100%',
            }}
            whileHover={{ translateX: '100%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>Quiero estar dentro →</span>
        </motion.button>
      </div>
    </div>
  )
}
