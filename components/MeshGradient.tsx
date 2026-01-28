'use client'

import { useEffect, useState } from 'react'

/**
 * Premium Mesh Gradient Background
 * Ultra-smooth anti-banding with animated orbs and noise dithering
 * Inspired by Apple's design language
 */

interface MeshGradientProps {
  variant?: 'default' | 'subtle' | 'warm' | 'cool' | 'aurora' | 'midnight'
  className?: string
  animated?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export default function MeshGradient({ 
  variant = 'default', 
  className = '',
  animated = true,
  intensity = 'medium'
}: MeshGradientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Intensity multipliers
  const intensityMap = {
    low: 0.5,
    medium: 1,
    high: 1.5
  }
  const mult = intensityMap[intensity]

  // Color configurations for each variant - OPTIMIZED with debanding
  const variantConfig = {
    default: {
      gradient: `
        radial-gradient(
          ellipse 80% 60% at 25% 20%,
          rgba(139, 92, 246, 0.06) 0%,
          rgba(124, 58, 237, 0.04) 20%,
          rgba(109, 40, 217, 0.025) 40%,
          rgba(91, 33, 182, 0.015) 60%,
          transparent 80%
        ),
        radial-gradient(
          ellipse 75% 65% at 70% 60%,
          rgba(59, 130, 246, 0.05) 0%,
          rgba(37, 99, 235, 0.03) 25%,
          rgba(29, 78, 216, 0.018) 50%,
          rgba(30, 64, 175, 0.01) 75%,
          transparent 100%
        )
      `,
      ambient: 'rgba(100, 100, 140, 0.02)',
    },
    subtle: {
      gradient: `
        radial-gradient(
          ellipse 90% 70% at 50% 40%,
          rgba(168, 85, 247, 0.04) 0%,
          rgba(147, 51, 234, 0.025) 25%,
          rgba(126, 34, 206, 0.015) 50%,
          transparent 75%
        )
      `,
      ambient: 'rgba(140, 100, 180, 0.015)',
    },
    warm: {
      gradient: `
        radial-gradient(
          ellipse 75% 60% at 30% 25%,
          rgba(217, 119, 6, 0.06) 0%,
          rgba(194, 65, 12, 0.04) 25%,
          rgba(154, 52, 18, 0.025) 50%,
          transparent 75%
        ),
        radial-gradient(
          ellipse 70% 65% at 70% 70%,
          rgba(251, 146, 60, 0.05) 0%,
          rgba(249, 115, 22, 0.03) 30%,
          rgba(234, 88, 12, 0.018) 60%,
          transparent 85%
        )
      `,
      ambient: 'rgba(200, 150, 100, 0.02)',
    },
    cool: {
      gradient: `
        radial-gradient(
          ellipse 80% 70% at 35% 30%,
          rgba(59, 130, 246, 0.07) 0%,
          rgba(37, 99, 235, 0.045) 25%,
          rgba(29, 78, 216, 0.028) 50%,
          transparent 75%
        ),
        radial-gradient(
          ellipse 75% 65% at 70% 65%,
          rgba(96, 165, 250, 0.05) 0%,
          rgba(59, 130, 246, 0.03) 30%,
          rgba(37, 99, 235, 0.018) 60%,
          transparent 85%
        )
      `,
      ambient: 'rgba(100, 150, 200, 0.02)',
    },
    aurora: {
      gradient: `
        radial-gradient(
          ellipse 85% 75% at 20% 15%,
          rgba(167, 243, 208, 0.08) 0%,
          rgba(110, 231, 183, 0.05) 20%,
          rgba(52, 211, 153, 0.03) 40%,
          rgba(16, 185, 129, 0.018) 60%,
          transparent 80%
        ),
        radial-gradient(
          ellipse 80% 70% at 75% 50%,
          rgba(147, 197, 253, 0.06) 0%,
          rgba(96, 165, 250, 0.04) 25%,
          rgba(59, 130, 246, 0.025) 50%,
          transparent 75%
        ),
        radial-gradient(
          ellipse 70% 60% at 50% 80%,
          rgba(196, 181, 253, 0.05) 0%,
          rgba(167, 139, 250, 0.03) 30%,
          rgba(139, 92, 246, 0.018) 60%,
          transparent 85%
        )
      `,
      ambient: 'rgba(150, 200, 220, 0.02)',
    },
    midnight: {
      gradient: `
        radial-gradient(
          ellipse 90% 80% at 50% 35%,
          rgba(30, 58, 138, 0.12) 0%,
          rgba(30, 64, 175, 0.08) 20%,
          rgba(37, 99, 235, 0.05) 40%,
          rgba(59, 130, 246, 0.03) 60%,
          transparent 80%
        ),
        radial-gradient(
          ellipse 75% 65% at 25% 70%,
          rgba(30, 64, 175, 0.08) 0%,
          rgba(29, 78, 216, 0.05) 30%,
          rgba(37, 99, 235, 0.03) 60%,
          transparent 85%
        )
      `,
      ambient: 'rgba(30, 50, 100, 0.025)',
    },
  }

  const config = variantConfig[variant]

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Deep black base with subtle gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            #000000 0%,
            #010101 20%,
            #020202 40%,
            #030303 60%,
            #020202 80%,
            #000000 100%
          )`
        }}
      />
      
      {/* Layered CSS gradients - no blur, pure debanding */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: config.gradient,
          opacity: mounted ? mult : 0,
          transition: 'opacity 1.2s ease-out',
        }}
      />

      {/* Ambient glow layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 120% 100% at 50% 50%,
            ${config.ambient} 0%,
            transparent 70%
          )`
        }}
      />

      {/* Premium noise texture for anti-banding - OPTIMIZED */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
          opacity: 0.02,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Elegant vignette with multiple stops for smoothness */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 90% 90% at 50% 50%,
            transparent 0%,
            transparent 30%,
            rgba(0, 0, 0, 0.03) 45%,
            rgba(0, 0, 0, 0.08) 55%,
            rgba(0, 0, 0, 0.15) 65%,
            rgba(0, 0, 0, 0.25) 75%,
            rgba(0, 0, 0, 0.35) 85%,
            rgba(0, 0, 0, 0.45) 95%,
            rgba(0, 0, 0, 0.5) 100%
          )`,
        }}
      />

      {/* Top light source accent */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 100% 50% at 50% -10%,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.015) 30%,
            transparent 60%
          )`,
        }}
      />
    </div>
  )
}
