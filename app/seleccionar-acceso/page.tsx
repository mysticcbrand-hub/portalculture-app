'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SeleccionarAcceso() {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)

  const handleWaitlist = () => {
    window.open('https://whop.com/checkout/plan_2kXdGgagLpw4A', '_blank')
  }

  const handleFastPass = () => {
    window.open('https://whop.com/checkout/plan_2juGEWOZ7uBGM', '_blank')
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black">
      {/* Mesh Gradient Background - Anti-banding */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0">
          {/* Blob 1 - Burnt Orange */}
          <div 
            className="absolute w-[900px] h-[900px] rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle, #c2410c 0%, #a03808 30%, #7d2a06 50%, transparent 70%)',
              top: '-10%',
              left: '15%',
              animation: 'meshFloat1 20s ease-in-out infinite',
              filter: 'blur(140px) saturate(1.2)',
            }}
          />
          
          {/* Blob 2 - Blue */}
          <div 
            className="absolute w-[750px] h-[750px] rounded-full opacity-28"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, #2563eb 30%, #1d4ed8 50%, transparent 70%)',
              bottom: '0%',
              right: '10%',
              animation: 'meshFloat2 18s ease-in-out infinite',
              filter: 'blur(120px) saturate(1.2)',
            }}
          />
          
          {/* Blob 3 - Teal */}
          <div 
            className="absolute w-[650px] h-[650px] rounded-full opacity-18"
            style={{
              background: 'radial-gradient(circle, #0d9488 0%, #0f766e 30%, #115e59 50%, transparent 70%)',
              top: '35%',
              right: '25%',
              animation: 'meshFloat3 22s ease-in-out infinite',
              filter: 'blur(100px) saturate(1.2)',
            }}
          />
          
          {/* Blob 4 - Slate Blue */}
          <div 
            className="absolute w-[550px] h-[550px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #1e40af 0%, #1e3a8a 30%, #1e3a8a 50%, transparent 70%)',
              bottom: '25%',
              left: '5%',
              animation: 'meshFloat4 24s ease-in-out infinite',
              filter: 'blur(90px) saturate(1.2)',
            }}
          />
        </div>
        
        {/* Noise dithering overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'6.5\' numOctaves=\'2\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
          }}
        />
        
        {/* Depth overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span
              style={{
                background: 'linear-gradient(135deg, #C0C0C0, #FFFFFF, #A8A8A8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Elige tu acceso
            </span>
          </h1>
          <p className="text-xl text-white/60">Dos caminos hacia Portal Culture</p>
        </div>

        {/* Options - Compact horizontal cards on mobile */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Option 1: Acceso Inmediato (Pago) */}
          <div
            onMouseEnter={() => setHoveredOption(1)}
            onMouseLeave={() => setHoveredOption(null)}
            className="order-1 group relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl lg:rounded-3xl p-4 lg:p-10 transition-all duration-500 hover:bg-white/8 hover:border-white/30 hover:scale-[1.01] lg:hover:scale-105"
          >
            {/* Header - Horizontal layout on mobile */}
            <div className="flex items-start justify-between gap-4 mb-3 lg:mb-6">
              <div className="flex-1">
                <span className="text-[10px] lg:text-sm font-mono text-yellow-400 uppercase tracking-wider">Opción 1</span>
                <h2 className="text-xl lg:text-4xl font-bold text-white mt-1 lg:mt-2 mb-1 lg:mb-4">Acceso Inmediato</h2>
                
                {/* Pricing inline */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-5xl font-bold text-white">17€</span>
                  <span className="text-white/50 text-xs">una vez</span>
                </div>
              </div>
            </div>

            {/* Benefits - 2 columns on mobile */}
            <ul className="grid grid-cols-2 lg:flex lg:flex-col gap-2 lg:gap-4 mb-4 lg:mb-8">
              <li className="flex items-start gap-2 text-white/90">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs lg:text-base">Dashboard</span>
              </li>
              <li className="flex items-start gap-2 text-white/90">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">Sin esperas</span>
              </li>
              <li className="flex items-start gap-2 text-white/90">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">5 Templos + NOVA</span>
              </li>
              <li className="flex items-start gap-2 text-white/90">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">De por vida</span>
              </li>
            </ul>

            {/* CTA */}
            <button
              onClick={handleFastPass}
              className="w-full px-5 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black text-sm lg:text-base font-bold rounded-xl transition-all duration-300 cursor-pointer active:scale-95 lg:hover:scale-105"
            >
              Acceder Ya →
            </button>
            
            <p className="text-xs lg:text-sm text-center mt-3 lg:mt-4">
              <span className="text-yellow-400 font-semibold">Valorado en +500€</span>
            </p>
          </div>

          {/* Option 2: Acceso Gratuito */}
          <div
            onMouseEnter={() => setHoveredOption(2)}
            onMouseLeave={() => setHoveredOption(null)}
            className="order-2 group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-10 transition-all duration-500 hover:bg-white/8 hover:border-white/20 hover:scale-[1.01] lg:hover:scale-105"
          >
            {/* Glow effect - desktop only */}
            <div className="hidden lg:block absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl" />

            {/* Header - Horizontal layout on mobile */}
            <div className="flex items-start justify-between gap-4 mb-3 lg:mb-6">
              <div className="flex-1">
                <span className="text-[10px] lg:text-sm font-mono text-white/40 uppercase tracking-wider">Opción 2</span>
                <h2 className="text-xl lg:text-4xl font-bold text-white mt-1 lg:mt-2 mb-1 lg:mb-4">Acceso Gratuito</h2>
                
                {/* Pricing inline */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-5xl font-bold text-white">GRATIS</span>
                </div>
                <p className="text-[10px] lg:text-sm text-white/50 mt-0.5">Acceso limitado</p>
              </div>
            </div>

            {/* Benefits - 2 columns on mobile */}
            <ul className="grid grid-cols-2 lg:flex lg:flex-col gap-2 lg:gap-4 mb-4 lg:mb-8">
              <li className="flex items-start gap-2 text-white/70">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-white/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">Discord</span>
              </li>
              <li className="flex items-start gap-2 text-white/70">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-white/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">Comunidad</span>
              </li>
              <li className="flex items-start gap-2 text-white/70">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-white/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">Contenido básico</span>
              </li>
              <li className="flex items-start gap-2 text-white/70">
                <svg className="w-4 h-4 lg:w-6 lg:h-6 text-white/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs lg:text-base">Sin compromiso</span>
              </li>
            </ul>

            <button
              onClick={handleWaitlist}
              className="w-full px-5 py-3 lg:px-8 lg:py-4 bg-white/10 hover:bg-white/15 text-white text-sm lg:text-base font-semibold rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 cursor-pointer active:scale-95"
            >
              Acceder Gratis
            </button>

            <p className="text-xs text-white/40 text-center mt-3 lg:mt-4">
              Sin compromiso · 100% gratuito
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 text-white/30">
            <span className="text-xs">🔒 Pago Seguro</span>
            <span className="text-xs">⚡ Acceso Instantáneo</span>
            <span className="text-xs">💯 Valor Infinito</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes meshFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -100px) scale(1.15); }
          66% { transform: translate(-40px, 80px) scale(0.95); }
        }
        
        @keyframes meshFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 90px) scale(1.1); }
          66% { transform: translate(50px, -60px) scale(0.92); }
        }
        
        @keyframes meshFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(90px, 50px) scale(1.12); }
          66% { transform: translate(-60px, -80px) scale(0.9); }
        }
        
        @keyframes meshFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, -90px) scale(1.18); }
          66% { transform: translate(70px, 60px) scale(0.88); }
        }
      `}</style>
    </main>
  )
}
