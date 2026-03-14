'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface TextLineConfig {
  id: string
  text: string
  size: number
  weight: number
  color: string
  letterSpacing: string
  delay: number
  pauseAfter: number
  marginBottom?: number
  textTransform?: 'uppercase' | 'none'
}

// ═══════════════════════════════════════════════════════════════════
// TEXT SEQUENCE
// ═══════════════════════════════════════════════════════════════════

const TEXT_SEQUENCE: TextLineConfig[] = [
  {
    id: 'line1',
    text: 'Llevas tiempo sintiéndolo.',
    size: 22,
    weight: 500,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: '-0.025em',
    delay: 1.5,
    pauseAfter: 1.8,
    marginBottom: 20,
  },
  {
    id: 'line2a',
    text: 'Que puedes más.',
    size: 17,
    weight: 400,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '-0.015em',
    delay: 0,
    pauseAfter: 0,
    marginBottom: 4,
  },
  {
    id: 'line2b',
    text: 'Que el entorno que tienes se te ha quedado pequeño.',
    size: 17,
    weight: 400,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '-0.015em',
    delay: 0.55,
    pauseAfter: 2.2,
    marginBottom: 24,
  },
  {
    id: 'line3',
    text: 'No estás equivocado.',
    size: 22,
    weight: 600,
    color: 'rgba(255,255,255,0.96)',
    letterSpacing: '-0.028em',
    delay: 0,
    pauseAfter: 1.8,
    marginBottom: 28,
  },
  {
    id: 'line4',
    text: 'Portal Culture.',
    size: 13,
    weight: 500,
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    delay: 0,
    pauseAfter: 1.2,
    marginBottom: 40,
  },
]

// ═══════════════════════════════════════════════════════════════════
// GRAIN LAYER
// ═══════════════════════════════════════════════════════════════════

function GrainLayer() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.028,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <filter id="auth-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.70"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 1 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#auth-grain)" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// BREATHING LOGO
// ═══════════════════════════════════════════════════════════════════

function BreathingLogo({ isMobile }: { isMobile: boolean }) {
  const size = isMobile ? 36 : 44

  return (
    <motion.div
      style={{
        position: 'relative',
        zIndex: 1,
        marginBottom: 64,
      }}
    >
      {/* Outer glow */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 4.0,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'mirror',
        }}
      />

      {/* Logo */}
      <motion.img
        src="/este_logo.ico"
        alt="Portal Culture"
        style={{
          width: size,
          height: size,
          imageRendering: 'crisp-edges' as React.CSSProperties['imageRendering'],
          display: 'block',
          position: 'relative',
          zIndex: 1,
          filter: 'brightness(0.9) saturate(0)',
        }}
        animate={{
          scale: [1, 1.018, 1],
          opacity: [0.82, 0.96, 0.82],
        }}
        transition={{
          duration: 4.0,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'mirror',
        }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEXT LINE WITH WORD-BY-WORD ANIMATION
// ═══════════════════════════════════════════════════════════════════

function TextLine({ line, isVisible }: { line: TextLineConfig; isVisible: boolean }) {
  const words = line.text.split(' ')

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 0.28em',
        marginBottom: line.marginBottom ?? 0,
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 0,
            y: 10,
            filter: 'blur(8px)',
          }}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                }
              : {
                  opacity: 0,
                  y: 10,
                  filter: 'blur(8px)',
                }
          }
          transition={{
            duration: 0.65,
            delay: i * 0.075,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            display: 'inline-block',
            fontSize: line.size,
            fontWeight: line.weight,
            color: line.color,
            letterSpacing: line.letterSpacing,
            textTransform: line.textTransform ?? 'none',
            lineHeight: 1.3,
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEXT SEQUENCE COMPONENT
// ═══════════════════════════════════════════════════════════════════

function TextSequence({ visibleLines }: { visibleLines: Set<string> }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        textAlign: 'center',
        maxWidth: 480,
        padding: '0 24px',
        zIndex: 1,
      }}
    >
      {/* Line 1 */}
      <TextLine line={TEXT_SEQUENCE[0]} isVisible={visibleLines.has('line1')} />

      {/* Lines 2a and 2b */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          marginBottom: 24,
        }}
      >
        <TextLine line={TEXT_SEQUENCE[1]} isVisible={visibleLines.has('line2a')} />
        <TextLine line={TEXT_SEQUENCE[2]} isVisible={visibleLines.has('line2b')} />
      </div>

      {/* Line 3 */}
      <TextLine line={TEXT_SEQUENCE[3]} isVisible={visibleLines.has('line3')} />

      {/* Line 4 */}
      <TextLine line={TEXT_SEQUENCE[4]} isVisible={visibleLines.has('line4')} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CTA COMPONENT
// ═══════════════════════════════════════════════════════════════════

function EnterCTA({ isVisible, onClick }: { isVisible: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)' }}
      animate={
        isVisible
          ? {
              opacity: 1,
              filter: 'blur(0px)',
            }
          : {
              opacity: 0,
              filter: 'blur(6px)',
            }
      }
      transition={{
        duration: 0.8,
        ease: [0.32, 0.72, 0, 1],
      }}
      style={{ zIndex: 1 }}
    >
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Extending line */}
        <motion.div
          style={{
            height: '0.5px',
            background: 'rgba(255,255,255,0.45)',
            borderRadius: 1,
          }}
          animate={{ width: hovered ? 32 : 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />

        {/* Text */}
        <motion.span
          animate={{
            color: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.50)',
          }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          Entrar
        </motion.span>
      </motion.button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function AuthGatewayPage() {
  const router = useRouter()
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set())
  const [isExiting, setIsExiting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Text sequencer
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    let cumulativeDelay = 0

    TEXT_SEQUENCE.forEach((line) => {
      cumulativeDelay += line.delay * 1000

      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => new Set([...prev, line.id]))
        }, cumulativeDelay)
      )

      const wordCount = line.text.split(' ').length
      const wordAnimDuration = wordCount * 75 + 650
      cumulativeDelay += wordAnimDuration + line.pauseAfter * 1000
    })

    // CTA appears after all lines
    const ctaDelay = cumulativeDelay + 200
    timers.push(
      setTimeout(() => {
        setVisibleLines((prev) => new Set([...prev, 'cta']))
      }, ctaDelay)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleEnter = () => {
    setIsExiting(true)
    setTimeout(() => {
      router.push('/seleccionar-acceso')
    }, 900)
  }

  return (
    <>
      {/* Grain */}
      <GrainLayer />

      {/* White flash during exit */}
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#ffffff',
          pointerEvents: 'none',
          zIndex: 100,
        }}
        animate={isExiting ? { opacity: [0, 0.12, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9, times: [0, 0.45, 1] }}
      />

      {/* Main content */}
      <motion.div
        animate={
          isExiting
            ? {
                opacity: 0,
                scale: 1.06,
                filter: 'blur(14px)',
              }
            : {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }
        }
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080808',
          zIndex: 1,
        }}
      >
        <BreathingLogo isMobile={isMobile} />
        <TextSequence visibleLines={visibleLines} />
        <EnterCTA isVisible={visibleLines.has('cta')} onClick={handleEnter} />
      </motion.div>
    </>
  )
}
