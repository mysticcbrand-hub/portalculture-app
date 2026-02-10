'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }
      
      setUser(user)
      setLoading(false)
    }
    
    getUser()
  }, [router, supabase.auth])

  const handleFastPass = () => {
    window.open('https://whop.com/portalculture/acceso-inmediato', '_blank')
  }

  const handleWaitlist = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Gradient Background VISIBLE - Sistema directo */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          background: `
            radial-gradient(circle 1200px at 20% 30%, rgba(59, 130, 246, 0.25) 0%, transparent 70%),
            radial-gradient(circle 1000px at 80% 70%, rgba(139, 92, 246, 0.22) 0%, transparent 65%),
            radial-gradient(circle 900px at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
            radial-gradient(circle 800px at 15% 80%, rgba(239, 68, 68, 0.20) 0%, transparent 60%),
            radial-gradient(circle 850px at 85% 20%, rgba(16, 185, 129, 0.20) 0%, transparent 60%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)
          `,
          backgroundColor: '#000000'
        }}
      />
      
      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Elige tu Acceso
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            Ambas opciones dan acceso completo de por vida. Elige la que mejor se adapte a ti.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* CARD 1: PAGO (PREMIUM) - Apple-style polish */}
          <div
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleFastPass}
            className="relative cursor-pointer group order-1"
            style={{ isolation: 'isolate', transform: 'translateZ(0)', willChange: 'transform' }}
          >
            {/* Outer glow - Solo exterior, no invade card */}
            <div 
              className="absolute -inset-[20px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(239,68,68,0.0) 0%, rgba(239,68,68,0.18) 50%, rgba(220,38,38,0.12) 70%, transparent 90%)',
                filter: 'blur(30px)',
                zIndex: -1,
              }}
            />
            
            {/* Card con gradiente premium */}
            <div 
              className="relative h-full p-6 sm:p-8 rounded-3xl border overflow-hidden backdrop-blur-2xl backdrop-saturate-150"
              style={{
                background: hoveredCard === 1
                  ? `
                    linear-gradient(135deg, 
                      rgba(239,68,68,0.20) 0%, 
                      rgba(220,38,38,0.14) 40%, 
                      rgba(185,28,28,0.10) 100%
                    )
                  `
                  : `
                    linear-gradient(135deg, 
                      rgba(239,68,68,0.12) 0%, 
                      rgba(220,38,38,0.08) 40%, 
                      rgba(185,28,28,0.05) 100%
                    )
                  `,
                borderColor: hoveredCard === 1 ? 'rgba(239,68,68,0.45)' : 'rgba(239,68,68,0.25)',
                transform: hoveredCard === 1 ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
                boxShadow: hoveredCard === 1 
                  ? '0 30px 60px -15px rgba(239,68,68,0.4), 0 15px 25px -10px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.03)' 
                  : '0 10px 30px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Shimmer effect loop - Premium ultra suave y lento */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255,255,255,0.06) 47%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 53%, transparent 60%, transparent 100%)',
                    transform: 'translateX(-100%) skewX(-12deg)',
                    width: '200%',
                    animation: hoveredCard === 1 ? 'shimmer 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' : 'none',
                  }}
                />
              </div>
              
              {/* Radial highlight on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                style={{
                  background: 'radial-gradient(circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.08) 0%, transparent 100%)',
                }}
              />
              
              {/* Tag PREMIUM */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs text-red-200 font-semibold uppercase tracking-wider">Premium</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl sm:text-6xl font-bold text-white">17€</span>
                  <span className="text-white/40 text-sm">una vez</span>
                </div>
                <p className="text-red-200/70 text-sm font-medium">Acceso inmediato sin esperas</p>
              </div>

              {/* Features - PREMIUM */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/90 text-sm sm:text-base font-medium">⚡ Acceso instantáneo</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/90 text-sm sm:text-base">5 Templos desbloqueados</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/90 text-sm sm:text-base">NOVA AI ilimitado</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/90 text-sm sm:text-base">Rol Premium Discord</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/90 text-sm sm:text-base">Soporte prioritario</span>
                </li>
              </ul>

              {/* Button Premium - Apple polish */}
              <a
                href="https://whop.com/portalculture/acceso-inmediato"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full py-4 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-sm font-bold rounded-2xl text-center overflow-hidden group/btn"
                style={{
                  boxShadow: '0 4px 14px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(239,68,68,0.45), 0 6px 20px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.25)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Acceder ahora
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* Subtle shimmer on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  }}
                />
              </a>
            </div>
          </div>

          {/* CARD 2: GRATIS (SUBTLE) - Apple-style minimal */}
          <div
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleWaitlist}
            className="relative cursor-pointer group order-2"
            style={{ isolation: 'isolate', transform: 'translateZ(0)', willChange: 'transform' }}
          >
            {/* Outer glow azul muy suave */}
            <div 
              className="absolute -inset-2 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 110% 110% at 50% 50%, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.08) 50%, transparent 75%)',
                filter: 'blur(24px)',
                zIndex: -1,
              }}
            />
            
            {/* Card con gradiente azul sutil */}
            <div 
              className="relative h-full p-6 sm:p-8 rounded-3xl border backdrop-blur-xl backdrop-saturate-150 overflow-hidden"
              style={{
                background: hoveredCard === 2
                  ? `
                    linear-gradient(135deg, 
                      rgba(59,130,246,0.09) 0%, 
                      rgba(37,99,235,0.06) 40%, 
                      rgba(29,78,216,0.04) 100%
                    )
                  `
                  : `
                    linear-gradient(135deg, 
                      rgba(59,130,246,0.05) 0%, 
                      rgba(37,99,235,0.03) 40%, 
                      rgba(29,78,216,0.02) 100%
                    )
                  `,
                borderColor: hoveredCard === 2 ? 'rgba(59,130,246,0.28)' : 'rgba(59,130,246,0.18)',
                transform: hoveredCard === 2 ? 'translateY(-3px) scale(1.005)' : 'translateY(0) scale(1)',
                boxShadow: hoveredCard === 2 
                  ? '0 20px 45px -15px rgba(59,130,246,0.2), 0 10px 20px -8px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 15px rgba(255,255,255,0.02)' 
                  : '0 10px 30px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              {/* Subtle radial highlight on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                style={{
                  background: 'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.04) 0%, transparent 100%)',
                }}
              />
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs text-blue-200/80 font-medium uppercase tracking-wider">Lista de espera</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl sm:text-6xl font-bold text-white">Gratis</span>
                </div>
                <p className="text-blue-200/60 text-sm">Tras aprobación manual</p>
              </div>

              {/* Features - GRATIS */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/75 text-sm sm:text-base">Aprobación en 1-3 días</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/75 text-sm sm:text-base">Templos progresivos</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/75 text-sm sm:text-base">NOVA AI estándar</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/75 text-sm sm:text-base">Acceso Discord</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/75 text-sm sm:text-base">Soporte estándar</span>
                </li>
              </ul>

              {/* Button Gratis - Subtle minimal */}
              <button
                onClick={handleWaitlist}
                className="relative w-full py-4 bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-800/90 text-white text-sm font-semibold rounded-2xl text-center overflow-hidden group/btn2"
                style={{
                  boxShadow: '0 3px 10px rgba(59,130,246,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)'
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.28), 0 4px 14px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(59,130,246,0.18), inset 0 1px 0 rgba(255,255,255,0.15)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.99)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continuar gratis
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Keyframes for shimmer animation - Apple style
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
    }
    100% {
      transform: translateX(100%) skewX(-15deg);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  if (!document.head.querySelector('style[data-shimmer]')) {
    styleSheet.setAttribute('data-shimmer', 'true');
    document.head.appendChild(styleSheet);
  }
}
