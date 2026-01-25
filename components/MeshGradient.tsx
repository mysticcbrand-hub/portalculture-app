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

  // Color configurations for each variant
  const variantConfig = {
    default: {
      orbs: [
        { color: 'rgba(255, 255, 255, 0.08)', size: 900, x: '20%', y: '15%', blur: 150 },
        { color: 'rgba(200, 200, 220, 0.06)', size: 700, x: '75%', y: '60%', blur: 120 },
        { color: 'rgba(180, 180, 200, 0.05)', size: 600, x: '40%', y: '80%', blur: 100 },
      ],
      ambient: 'rgba(255, 255, 255, 0.03)',
    },
    subtle: {
      orbs: [
        { color: 'rgba(255, 255, 255, 0.05)', size: 1000, x: '50%', y: '40%', blur: 180 },
        { color: 'rgba(230, 230, 240, 0.04)', size: 600, x: '80%', y: '20%', blur: 140 },
      ],
      ambient: 'rgba(255, 255, 255, 0.02)',
    },
    warm: {
      orbs: [
        { color: 'rgba(255, 200, 150, 0.08)', size: 800, x: '25%', y: '20%', blur: 140 },
        { color: 'rgba(255, 180, 120, 0.06)', size: 650, x: '70%', y: '65%', blur: 120 },
        { color: 'rgba(255, 220, 180, 0.05)', size: 550, x: '45%', y: '85%', blur: 100 },
      ],
      ambient: 'rgba(255, 230, 200, 0.02)',
    },
    cool: {
      orbs: [
        { color: 'rgba(100, 150, 255, 0.08)', size: 850, x: '30%', y: '25%', blur: 150 },
        { color: 'rgba(80, 120, 220, 0.06)', size: 700, x: '75%', y: '55%', blur: 130 },
        { color: 'rgba(120, 180, 255, 0.05)', size: 550, x: '20%', y: '75%', blur: 110 },
      ],
      ambient: 'rgba(150, 180, 255, 0.02)',
    },
    aurora: {
      orbs: [
        { color: 'rgba(100, 200, 180, 0.10)', size: 900, x: '15%', y: '10%', blur: 160 },
        { color: 'rgba(80, 150, 220, 0.08)', size: 750, x: '80%', y: '40%', blur: 140 },
        { color: 'rgba(150, 100, 200, 0.07)', size: 650, x: '50%', y: '75%', blur: 120 },
        { color: 'rgba(200, 150, 255, 0.05)', size: 500, x: '25%', y: '55%', blur: 100 },
      ],
      ambient: 'rgba(150, 200, 220, 0.02)',
    },
    midnight: {
      orbs: [
        { color: 'rgba(30, 60, 120, 0.15)', size: 1000, x: '50%', y: '30%', blur: 180 },
        { color: 'rgba(50, 80, 150, 0.10)', size: 700, x: '20%', y: '70%', blur: 150 },
        { color: 'rgba(40, 70, 140, 0.08)', size: 600, x: '80%', y: '60%', blur: 130 },
      ],
      ambient: 'rgba(30, 50, 100, 0.03)',
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

      {/* Animated gradient orbs */}
      {mounted && config.orbs.map((orb, index) => (
        <div
          key={index}
          className={`absolute rounded-full pointer-events-none ${
            animated ? `animate-mesh-float-${(index % 4) + 1}` : ''
          }`}
          style={{
            width: orb.size * mult,
            height: orb.size * mult,
            left: orb.x,
            top: orb.y,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(
              circle at center,
              ${orb.color} 0%,
              ${orb.color.replace(/[\d.]+\)$/, `${parseFloat(orb.color.match(/[\d.]+\)$/)?.[0] || '0.1') * 0.7})`)} 25%,
              ${orb.color.replace(/[\d.]+\)$/, `${parseFloat(orb.color.match(/[\d.]+\)$/)?.[0] || '0.1') * 0.4})`)} 50%,
              ${orb.color.replace(/[\d.]+\)$/, `${parseFloat(orb.color.match(/[\d.]+\)$/)?.[0] || '0.1') * 0.15})`)} 75%,
              transparent 100%
            )`,
            filter: `blur(${orb.blur}px)`,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1s ease-out',
          }}
        />
      ))}

      {/* Premium noise texture for anti-banding (SVG-based) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Secondary fine noise layer for extra smoothness */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise2)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          mixBlendMode: 'soft-light',
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
