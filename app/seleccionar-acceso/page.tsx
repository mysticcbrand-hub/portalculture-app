'use client'

import { useState } from 'react'

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
      {/* Premium Animated Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Animated gradient orbs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(120,80,200,0.15) 0%, rgba(100,60,180,0.08) 40%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            animation: 'meshFloat1 25s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(60,130,200,0.12) 0%, rgba(40,100,180,0.06) 40%, transparent 70%)',
            bottom: '-15%',
            right: '-5%',
            animation: 'meshFloat2 22s ease-in-out infinite',
            filter: 'blur(50px)',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,120,80,0.10) 0%, rgba(180,100,60,0.05) 40%, transparent 70%)',
            top: '40%',
            right: '20%',
            animation: 'meshFloat3 28s ease-in-out infinite',
            filter: 'blur(70px)',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(100,180,150,0.08) 0%, rgba(80,150,120,0.04) 40%, transparent 70%)',
            bottom: '30%',
            left: '15%',
            animation: 'meshFloat4 30s ease-in-out infinite',
            filter: 'blur(55px)',
          }}
        />

        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

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

        {/* Options - Balanced glassmorphism cards */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Option 1: Acceso Inmediato (Pago) */}
          <div
            onMouseEnter={() => setHoveredOption(1)}
            onMouseLeave={() => setHoveredOption(null)}
            className="order-1 group relative animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {/* Hover glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-white/10 to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute -inset-4 bg-gradient-radial from-amber-500/10 via-transparent to-transparent blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700" />
            
            <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/[0.15] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <span className="text-[10px] lg:text-xs font-medium text-white/50 uppercase tracking-widest">Opción 1</span>
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
                  <li key={i} className="flex items-center gap-3 text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm lg:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleFastPass}
                className="relative w-full py-4 lg:py-5 bg-white text-black text-sm lg:text-base font-bold rounded-2xl overflow-hidden group/btn transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Acceder Ahora
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              </button>
              
              <p className="text-center mt-4 text-xs lg:text-sm text-white/40">
                Valorado en +500€
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
            {/* Hover glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/15 via-white/8 to-white/3 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute -inset-4 bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-2xl opacity-0 group-hover:opacity-50 transition-all duration-700" />
            
            <div className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-6 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:bg-white/[0.05] group-hover:border-white/[0.12] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]">
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <span className="text-[10px] lg:text-xs font-medium text-white/40 uppercase tracking-widest">Opción 2</span>
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
                  { icon: '🔓', text: 'Cursos desbloqueables al tiempo' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors duration-300">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm lg:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleWaitlist}
                className="relative w-full py-4 lg:py-5 bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm lg:text-base font-semibold rounded-2xl border border-white/[0.1] hover:border-white/[0.2] transition-all duration-300 group/btn2 active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Unirse a la Lista
                  <svg className="w-4 h-4 opacity-60 group-hover/btn2:opacity-100 group-hover/btn2:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover/btn2:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>

              <p className="text-xs text-white/30 text-center mt-4">
                Sin tarjeta de crédito · 100% gratuito
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 lg:mt-16 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="inline-flex items-center justify-center gap-6 lg:gap-10 px-6 py-3 bg-white/[0.02] backdrop-blur-xl rounded-full border border-white/[0.04]">
            <div className="flex items-center gap-2 text-white/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] lg:text-xs uppercase tracking-wider">Pago Seguro</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-white/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] lg:text-xs uppercase tracking-wider">Acceso Instantáneo</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-2 text-white/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs uppercase tracking-wider">Privacidad Protegida</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes meshFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(80px, -60px) scale(1.1) rotate(5deg); }
          66% { transform: translate(-40px, 40px) scale(0.95) rotate(-3deg); }
        }
        @keyframes meshFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-70px, 50px) scale(1.08) rotate(-4deg); }
          66% { transform: translate(50px, -40px) scale(0.92) rotate(6deg); }
        }
        @keyframes meshFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(60px, 30px) scale(1.12) rotate(3deg); }
          66% { transform: translate(-50px, -50px) scale(0.9) rotate(-5deg); }
        }
        @keyframes meshFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-30px, -50px) scale(1.15) rotate(-2deg); }
          66% { transform: translate(40px, 40px) scale(0.88) rotate(4deg); }
        }
      `}</style>
    </main>
  )
}
