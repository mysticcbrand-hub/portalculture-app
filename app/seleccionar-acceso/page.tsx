'use client'

import { useState } from 'react'
import MeshGradient from '@/components/MeshGradient'

export default function SeleccionarAcceso() {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)

  const handleWaitlist = () => {
    window.location.href = '/cuestionario'
  }

  const handleFastPass = () => {
    window.open('https://whop.com/checkout/plan_2juGEWOZ7uBGM', '_blank')
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-black">
      {/* Premium Mesh Gradient Background */}
      <MeshGradient variant="aurora" intensity="high" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-block relative mb-4">
            <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full opacity-60" />
            <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-bold">
              <span
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 40%, #ffffff 60%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Elige tu acceso
              </span>
            </h1>
          </div>
          <p className="text-lg lg:text-xl text-white/40 font-light">Dos caminos hacia Portal Culture</p>
        </div>

        {/* Options - Premium glassmorphism cards */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Option 1: Acceso Inmediato (Pago) - FEATURED */}
          <div
            onMouseEnter={() => setHoveredOption(1)}
            onMouseLeave={() => setHoveredOption(null)}
            className="order-1 group relative animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {/* Premium glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-400/30 via-orange-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute -inset-8 bg-gradient-radial from-amber-500/20 via-transparent to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/30">
                Recomendado
              </div>
            </div>
            
            <div className="relative bg-black/60 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 group-hover:border-amber-500/30">
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              
              {/* Header */}
              <div className="mb-6 lg:mb-8 pt-2">
                <span className="text-[10px] lg:text-xs font-medium text-amber-400/80 uppercase tracking-widest">Opción 1</span>
                <h2 className="text-2xl lg:text-4xl font-bold text-white mt-2 mb-4">Acceso Inmediato</h2>
                
                {/* Pricing */}
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl lg:text-6xl font-bold text-white">17€</span>
                  <span className="text-white/40 text-sm">pago único</span>
                </div>
              </div>

              {/* Benefits */}
              <ul className="space-y-3 lg:space-y-4 mb-8">
                {[
                  { icon: '⚡', text: 'Acceso instantáneo al Dashboard' },
                  { icon: '🏛️', text: '5 Templos completos + NOVA AI' },
                  { icon: '♾️', text: 'Acceso de por vida' },
                  { icon: '🚀', text: 'Sin lista de espera' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm lg:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleFastPass}
                className="relative w-full py-4 lg:py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm lg:text-base font-bold rounded-2xl overflow-hidden group/btn transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.3)] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Acceder Ahora
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </button>
              
              <p className="text-center mt-4 text-xs lg:text-sm">
                <span className="text-amber-400/80 font-medium">Valorado en +500€</span>
                <span className="text-white/30 mx-2">·</span>
                <span className="text-white/40">Oferta limitada</span>
              </p>
            </div>
          </div>

          {/* Option 2: Acceso Gratuito */}
          <div
            onMouseEnter={() => setHoveredOption(2)}
            onMouseLeave={() => setHoveredOption(null)}
            className="order-2 group relative animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Subtle glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            
            <div className="relative bg-black/40 backdrop-blur-3xl border border-white/[0.06] rounded-3xl p-6 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:border-white/15 group-hover:bg-black/50">
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <span className="text-[10px] lg:text-xs font-medium text-white/30 uppercase tracking-widest">Opción 2</span>
                <h2 className="text-2xl lg:text-4xl font-bold text-white mt-2 mb-4">Lista de Espera</h2>
                
                {/* Pricing */}
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl lg:text-6xl font-bold text-white">Gratis</span>
                </div>
                <p className="text-white/30 text-sm mt-2">Tiempo de espera: 3-7 días</p>
              </div>

              {/* Benefits */}
              <ul className="space-y-3 lg:space-y-4 mb-8">
                {[
                  { icon: '📝', text: 'Completa un cuestionario' },
                  { icon: '⏳', text: 'Espera la aprobación manual' },
                  { icon: '✅', text: 'Mismo acceso que la opción de pago' },
                  { icon: '🎯', text: 'Sin compromiso alguno' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/50">
                    <span className="text-lg opacity-70">{item.icon}</span>
                    <span className="text-sm lg:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleWaitlist}
                className="relative w-full py-4 lg:py-5 bg-white/[0.06] hover:bg-white/[0.10] text-white text-sm lg:text-base font-semibold rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 group/btn2 active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  Unirse a la Lista
                  <svg className="w-4 h-4 opacity-50 group-hover/btn2:opacity-100 group-hover/btn2:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <p className="text-xs text-white/25 text-center mt-4">
                Sin tarjeta de crédito · 100% gratuito
              </p>
            </div>
          </div>
        </div>

        {/* Premium Trust badges */}
        <div className="mt-12 lg:mt-16 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="inline-flex items-center justify-center gap-6 lg:gap-10 px-6 py-3 bg-white/[0.02] rounded-full border border-white/[0.04]">
            <div className="flex items-center gap-2 text-white/25">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] lg:text-xs uppercase tracking-wider">Pago Seguro</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-white/25">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] lg:text-xs uppercase tracking-wider">Acceso Instantáneo</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-2 text-white/25">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs uppercase tracking-wider">Satisfacción Garantizada</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
