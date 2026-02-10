'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import MeshGradient from '@/components/MeshGradient'

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Premium Mesh Gradient Background - Igual que landing */}
      <MeshGradient variant="midnight" intensity="high" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse 95% 75% at 20% 10%, rgba(59, 130, 246, 0.20) 0%, rgba(37, 99, 235, 0.12) 35%, transparent 70%),
          radial-gradient(ellipse 85% 75% at 85% 75%, rgba(139, 92, 246, 0.18) 0%, rgba(109, 40, 217, 0.10) 40%, transparent 75%),
          radial-gradient(ellipse 75% 65% at 50% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.08) 45%, transparent 75%),
          radial-gradient(ellipse 70% 60% at 15% 85%, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.06) 45%, transparent 75%),
          linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.50) 100%)`
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
          
          {/* CARD 1: PAGO (ROJA PREMIUM) */}
          <div
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleFastPass}
            className="relative cursor-pointer group order-1"
          >
            {/* Outer glow rojo */}
            <div 
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 110% 100% at 50% 50%, rgba(239,68,68,0.25) 0%, rgba(220,38,38,0.12) 40%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            
            {/* Card con gradiente rojo */}
            <div 
              className="relative h-full p-6 sm:p-8 rounded-3xl border overflow-hidden transition-all duration-500 backdrop-blur-xl backdrop-saturate-150"
              style={{
                background: hoveredCard === 1
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.10) 50%, rgba(185,28,28,0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0.04) 100%)',
                borderColor: hoveredCard === 1 ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.20)',
                transform: hoveredCard === 1 ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hoveredCard === 1 
                  ? '0 25px 50px -12px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' 
                  : '0 10px 30px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Shimmer effect - Fixed smooth */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-out bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              </div>
              
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

              {/* Features */}
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/80 text-sm sm:text-base">Dashboard + 5 Templos + NOVA AI</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/80 text-sm sm:text-base font-medium">⚡ Templos desbloqueados al instante</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/80 text-sm sm:text-base">Rol exclusivo en Discord</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/80 text-sm sm:text-base">Acceso de por vida</span>
                </li>
              </ul>

              {/* Button Premium */}
              <a
                href="https://whop.com/portalculture/acceso-inmediato"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:from-red-500 hover:to-red-600 hover:shadow-[0_10px_40px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-[0.98] text-center overflow-hidden group/btn"
              >
                <span className="relative z-10">Acceder ahora →</span>
                {/* Inner shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* CARD 2: GRATIS (AZUL NORMAL) */}
          <div
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleWaitlist}
            className="relative cursor-pointer group order-2"
          >
            {/* Outer glow azul suave */}
            <div 
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 110% 100% at 50% 50%, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.08) 40%, transparent 70%)',
                filter: 'blur(18px)',
              }}
            />
            
            {/* Card con gradiente azul */}
            <div 
              className="relative h-full p-6 sm:p-8 rounded-3xl border transition-all duration-500 backdrop-blur-xl backdrop-saturate-150 overflow-hidden"
              style={{
                background: hoveredCard === 2
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(37,99,235,0.04) 50%, rgba(29,78,216,0.02) 100%)',
                borderColor: hoveredCard === 2 ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)',
                transform: hoveredCard === 2 ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredCard === 2 
                  ? '0 20px 40px -15px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.12)' 
                  : '0 10px 30px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
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

              {/* Features */}
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/70 text-sm sm:text-base">Dashboard + 5 Templos + NOVA AI</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/70 text-sm sm:text-base">Templos se desbloquean progresivamente</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/70 text-sm sm:text-base">Rol exclusivo en Discord</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white/70 text-sm sm:text-base">Espera de 1-3 días (revisión manual)</span>
                </li>
              </ul>

              {/* Button Normal */}
              <button
                onClick={handleWaitlist}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-2xl transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:scale-[1.01] active:scale-[0.99] text-center"
              >
                Continuar gratis →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
