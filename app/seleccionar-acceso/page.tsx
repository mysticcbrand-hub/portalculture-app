'use client'

import { useState } from 'react'

export default function SeleccionarAcceso() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const handleWaitlist = () => {
    window.location.href = '/cuestionario'
  }

  const handleFastPass = () => {
    window.open('https://whop.com/checkout/plan_2juGEWOZ7uBGM', '_blank')
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden">
      {/* Clean gradient background */}
      <div className="fixed inset-0 bg-[#030303]">
        {/* Subtle top light */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
        />
        {/* Subtle bottom accent */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(255,255,255,0.015) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header - Simple and clean */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-3 tracking-tight">
            Elige cómo entrar
          </h1>
          <p className="text-white/40 text-lg">Mismo destino, diferente camino</p>
        </div>

        {/* Cards container */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          
          {/* Card 1: Pago */}
          <div
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleFastPass}
            className="relative cursor-pointer group"
          >
            {/* Card */}
            <div 
              className="relative h-full p-7 md:p-8 rounded-2xl border transition-all duration-300 ease-out"
              style={{
                background: hoveredCard === 1 
                  ? 'rgba(255,255,255,0.04)' 
                  : 'rgba(255,255,255,0.02)',
                borderColor: hoveredCard === 1 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(255,255,255,0.06)',
                transform: hoveredCard === 1 ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredCard === 1 
                  ? '0 20px 40px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset' 
                  : '0 0 0 1px rgba(255,255,255,0.02) inset',
              }}
            >
              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-[11px] text-white/50 uppercase tracking-wide font-medium">Acceso Inmediato</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-semibold text-white">17€</span>
                  <span className="text-white/30 text-sm">una vez</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/60 text-[15px]">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Dashboard + 5 Templos + NOVA
                </li>
                <li className="flex items-center gap-3 text-white/60 text-[15px]">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Acceso de por vida
                </li>
                <li className="flex items-center gap-3 text-white/60 text-[15px]">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Sin esperas
                </li>
              </ul>

              {/* Button */}
              <button
                className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-white/90"
              >
                Acceder ahora →
              </button>
            </div>
          </div>

          {/* Card 2: Gratuito */}
          <div
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleWaitlist}
            className="relative cursor-pointer group"
          >
            {/* Card */}
            <div 
              className="relative h-full p-7 md:p-8 rounded-2xl border transition-all duration-300 ease-out"
              style={{
                background: hoveredCard === 2 
                  ? 'rgba(255,255,255,0.04)' 
                  : 'rgba(255,255,255,0.02)',
                borderColor: hoveredCard === 2 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(255,255,255,0.06)',
                transform: hoveredCard === 2 ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredCard === 2 
                  ? '0 20px 40px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset' 
                  : '0 0 0 1px rgba(255,255,255,0.02) inset',
              }}
            >
              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-[11px] text-white/50 uppercase tracking-wide font-medium">Lista de Espera</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-semibold text-white">Gratis</span>
                </div>
                <p className="text-white/25 text-sm mt-1">3-7 días de espera</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/60 text-[15px]">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Mismo contenido completo
                </li>
                <li className="flex items-center gap-3 text-white/60 text-[15px]">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Cursos desbloqueables al tiempo
                </li>
                <li className="flex items-center gap-3 text-white/60 text-[15px]">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Aprobación manual requerida
                </li>
              </ul>

              {/* Button */}
              <button
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-semibold rounded-xl border border-white/10 hover:border-white/15 transition-all duration-200"
              >
                Solicitar acceso →
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-10">
          Ambas opciones incluyen acceso a la comunidad Discord
        </p>
      </div>
    </main>
  )
}
