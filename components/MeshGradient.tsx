'use client'

/**
 * Premium Mesh Gradient Background
 * Anti-banding with 10+ color stops and noise dithering
 */

interface MeshGradientProps {
  variant?: 'default' | 'subtle' | 'warm' | 'cool'
  className?: string
}

export default function MeshGradient({ variant = 'default', className = '' }: MeshGradientProps) {
  const gradients = {
    default: {
      primary: `radial-gradient(
        ellipse 80% 60% at 50% 40%,
        rgba(255, 255, 255, 0.10) 0%,
        rgba(245, 245, 250, 0.08) 10%,
        rgba(235, 235, 245, 0.06) 20%,
        rgba(220, 220, 235, 0.05) 30%,
        rgba(200, 200, 220, 0.04) 40%,
        rgba(180, 180, 200, 0.03) 50%,
        rgba(150, 150, 180, 0.02) 60%,
        rgba(120, 120, 150, 0.01) 70%,
        transparent 85%
      )`,
      secondary: `radial-gradient(
        ellipse 60% 40% at 75% 25%,
        rgba(200, 200, 220, 0.06) 0%,
        rgba(180, 180, 200, 0.04) 25%,
        rgba(160, 160, 180, 0.02) 50%,
        transparent 70%
      )`,
      tertiary: `radial-gradient(
        ellipse 50% 50% at 25% 70%,
        rgba(220, 220, 240, 0.04) 0%,
        rgba(200, 200, 220, 0.02) 40%,
        transparent 70%
      )`,
    },
    subtle: {
      primary: `radial-gradient(
        ellipse 90% 70% at 50% 50%,
        rgba(255, 255, 255, 0.06) 0%,
        rgba(240, 240, 245, 0.04) 30%,
        rgba(220, 220, 230, 0.02) 60%,
        transparent 85%
      )`,
      secondary: `radial-gradient(
        ellipse 60% 40% at 80% 20%,
        rgba(230, 230, 240, 0.04) 0%,
        rgba(210, 210, 225, 0.02) 40%,
        transparent 70%
      )`,
      tertiary: '',
    },
    warm: {
      primary: `radial-gradient(
        ellipse 80% 60% at 50% 40%,
        rgba(255, 245, 235, 0.10) 0%,
        rgba(250, 240, 230, 0.07) 20%,
        rgba(245, 235, 225, 0.05) 40%,
        rgba(240, 230, 220, 0.03) 60%,
        transparent 85%
      )`,
      secondary: `radial-gradient(
        ellipse 60% 40% at 70% 30%,
        rgba(255, 235, 220, 0.06) 0%,
        rgba(250, 230, 215, 0.03) 40%,
        transparent 70%
      )`,
      tertiary: '',
    },
    cool: {
      primary: `radial-gradient(
        ellipse 80% 60% at 50% 40%,
        rgba(235, 245, 255, 0.10) 0%,
        rgba(225, 240, 255, 0.07) 20%,
        rgba(215, 235, 250, 0.05) 40%,
        rgba(200, 225, 245, 0.03) 60%,
        transparent 85%
      )`,
      secondary: `radial-gradient(
        ellipse 60% 40% at 30% 60%,
        rgba(220, 240, 255, 0.06) 0%,
        rgba(210, 230, 250, 0.03) 40%,
        transparent 70%
      )`,
      tertiary: '',
    },
  }

  const g = gradients[variant]

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Base black */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Primary gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: g.primary }}
      />
      
      {/* Secondary gradient */}
      {g.secondary && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: g.secondary }}
        />
      )}
      
      {/* Tertiary gradient */}
      {g.tertiary && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: g.tertiary }}
        />
      )}
      
      {/* Noise texture for anti-banding */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          opacity: 0.04,
          mixBlendMode: 'soft-light',
        }}
      />
      
      {/* Subtle vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 85% 85% at 50% 50%,
            transparent 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.15) 80%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
        }}
      />
    </div>
  )
}
