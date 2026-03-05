'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [activeCard, setActiveCard] = useState<'paid' | 'free'>('paid')
  const [isShuffling, setIsShuffling] = useState(false)
  const [shuffleCount, setShuffleCount] = useState(0)
  const shuffleInterval = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  const startShuffle = useCallback(() => {
    if (isShuffling) return
    setIsShuffling(true)
    setShuffleCount(0)
    
    let count = 0
    const maxShuffles = 12
    
    shuffleInterval.current = setInterval(() => {
      setActiveCard(prev => prev === 'paid' ? 'free' : 'paid')
      count++
      setShuffleCount(count)
      
      if (count >= maxShuffles) {
        if (shuffleInterval.current) clearInterval(shuffleInterval.current)
        setIsShuffling(false)
      }
    }, 90)
  }, [isShuffling])

  const stopShuffle = useCallback(() => {
    if (shuffleInterval.current) {
      clearInterval(shuffleInterval.current)
    }
    setIsShuffling(false)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
      
      {/* Premium Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 hidden md:block" style={{
          background: `
            radial-gradient(ellipse 90% 75% at 10% 25%, rgba(220,38,38,0.3) 0%, rgba(185,28,28,0.1) 40%, transparent 70%),
            radial-gradient(ellipse 80% 70% at 90% 75%, rgba(37,99,235,0.25) 0%, rgba(29,78,216,0.08) 40%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 55%),
            #000000
          `
        }} />
        <div className="absolute inset-0 md:hidden" style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 10%, rgba(139,92,246,0.25) 0%, transparent 50%),
            radial-gradient(ellipse 90% 70% at 50% 95%, rgba(37,99,235,0.18) 0%, transparent 45%),
            #000000
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="fixed top-4 right-4 z-50">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Portal Culture</h1>
      </div>

      {/* MOBILE: Premium Card Stack */}
      <div className="relative z-10 w-full max-w-[320px] md:hidden">
        
        {/* Card Stack Container */}
        <div 
          className="relative aspect-[3/4] max-h-[480px] cursor-grab active:cursor-grabbing"
          onMouseDown={startShuffle}
          onMouseUp={stopShuffle}
          onMouseLeave={stopShuffle}
          onTouchStart={startShuffle}
          onTouchEnd={stopShuffle}
        >
          {/* FREE Card (Back) */}
          <div 
            className="absolute inset-0 rounded-[32px] overflow-hidden"
            style={{
              transform: `
                translateY(${activeCard === 'paid' ? 20 : 0}px) 
                scale(${activeCard === 'paid' ? 0.88 : 1})
                rotateY(${activeCard === 'paid' ? -8 : 0}deg)
              `,
              opacity: activeCard === 'paid' ? 0.4 : 1,
              filter: activeCard === 'paid' ? 'blur(2px)' : 'blur(0px)',
              zIndex: 1,
              transition: isShuffling ? 'none' : 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: 'center center',
              perspective: '1000px',
            }}
          >
            {/* Glass Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(160deg, rgba(30,58,138,0.8) 0%, rgba(15,23,42,0.92) 50%, rgba(3,7,18,0.98) 100%)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: `
                  0 35px 60px -15px rgba(0,0,0,0.7),
                  0 0 80px rgba(37,99,235,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.1),
                  inset 0 -1px 0 rgba(255,255,255,0.05)
                `,
              }}
            />
            
            {/* Shine Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>

            <div className="relative h-full p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-400">Lista de Espera</span>
              </div>
              
              {/* Price */}
              <div className="text-[2.75rem] font-bold text-white/90 mb-1 tracking-tight">Gratis</div>
              <p className="text-xs text-white/35 mb-5">tras aprobación manual</p>
              
              <div className="w-full h-px mb-5 bg-gradient-to-r from-blue-500/30 via-blue-500/20 to-transparent" />
              
              {/* Features */}
              <div className="flex-1 space-y-3">
                {[
                  { icon: '✓', text: 'Aprobación manual' },
                  { icon: '✓', text: 'Templos progresivos' },
                  { icon: '✓', text: 'NOVA 10 msg/día' },
                  { icon: '✓', text: 'Discord exclusivo' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-blue-400/70 text-[10px]">{f.icon}</span>
                    <span className="text-xs text-white/50">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                onClick={(e) => { e.stopPropagation(); router.push('/cuestionario') }}
                className="w-full py-3.5 mt-4 rounded-2xl text-xs font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.7) 0%, rgba(29,78,216,0.6) 100%)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  boxShadow: '0 8px 25px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                Solicitar Gratis
              </button>
            </div>
          </div>

          {/* PAID Card (Front) */}
          <div 
            className="absolute inset-0 rounded-[32px] overflow-hidden"
            style={{
              transform: `
                translateY(${activeCard === 'free' ? 20 : 0}px) 
                scale(${activeCard === 'free' ? 0.88 : 1})
                rotateY(${activeCard === 'free' ? 8 : 0}deg)
              `,
              opacity: activeCard === 'free' ? 0.4 : 1,
              filter: activeCard === 'free' ? 'blur(2px)' : 'blur(0px)',
              zIndex: 10,
              transition: isShuffling ? 'none' : 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: 'center center',
              perspective: '1000px',
            }}
          >
            {/* Glass Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(160deg, rgba(153,27,27,0.85) 0%, rgba(69,10,10,0.92) 50%, rgba(20,5,5,0.98) 100%)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: `
                  0 35px 60px -15px rgba(0,0,0,0.7),
                  0 0 80px rgba(220,38,38,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.1),
                  inset 0 -1px 0 rgba(255,255,255,0.05)
                `,
              }}
            />
            
            {/* Shine Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-400/10 rounded-full blur-3xl" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            </div>

            {/* Badge */}
            <div className="absolute top-5 right-5 z-20">
              <div 
                className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style={{ 
                  background: 'rgba(220,38,38,0.3)', 
                  border: '1px solid rgba(239,68,68,0.5)', 
                  color: '#fca5a5',
                  boxShadow: '0 0 25px rgba(220,38,38,0.3)',
                }}
              >
                ⚡ Popular
              </div>
            </div>

            <div className="relative h-full p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400">Acceso</span>
              </div>
              
              {/* Price */}
              <div className="text-[2.75rem] font-bold text-white mb-1 tracking-tight">17€</div>
              <p className="text-xs text-white/35 mb-5">pago único</p>
              
              <div className="w-full h-px mb-5 bg-gradient-to-r from-red-500/40 via-red-500/20 to-transparent" />
              
              {/* Features */}
              <div className="flex-1 space-y-3">
                {[
                  { icon: '✓', text: 'Acceso inmediato' },
                  { icon: '✓', text: '5 Templos' },
                  { icon: '✓', text: 'NOVA ilimitado' },
                  { icon: '✓', text: 'Discord exclusivo' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-red-400/80 text-[10px]">{f.icon}</span>
                    <span className="text-xs text-white/70">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                onClick={(e) => { e.stopPropagation(); window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer') }}
                className="w-full py-3.5 mt-4 rounded-2xl text-xs font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 8px 25px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                Acceso 17€ →
              </button>
            </div>
          </div>
        </div>

        {/* Shuffle Hint */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-white/40 text-[11px]">
            {isShuffling ? 'Mezclando...' : 'Toca y arrastra para mezclar'}
          </p>
          <div className="flex justify-center items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full transition-all duration-200 ${activeCard === 'free' ? 'bg-blue-400 scale-125' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full transition-all duration-200 ${activeCard === 'paid' ? 'bg-red-500 scale-125' : 'bg-white/20'}`} />
          </div>
        </div>
      </div>

      {/* DESKTOP: Premium Cards Side by Side */}
      <div className="relative z-10 w-full max-w-5xl hidden md:flex gap-6 px-4">
        
        {/* PAID Card */}
        <div 
          className="flex-1 rounded-[32px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.995]"
          style={{
            background: 'linear-gradient(160deg, rgba(153,27,27,0.8) 0%, rgba(69,10,10,0.9) 50%, rgba(20,5,5,0.95) 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(220,38,38,0.1)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl" />
          
          <div className="absolute top-6 right-6">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 border border-red-500/40 text-red-300">⚡ Popular</span>
          </div>

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(248,113,113,0.6)]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-red-400">Acceso Inmediato</span>
            </div>
            
            <div className="text-6xl font-bold text-white mb-2 tracking-tight">17€</div>
            <p className="text-sm text-white/40 mb-6">pago único · sin suscripción</p>
            
            <div className="w-full h-px mb-6 bg-gradient-to-r from-red-500/40 to-transparent" />
            
            <div className="space-y-3.5 mb-8">
              {['Acceso completo inmediato', 'Sin espera ni aprobación', '5 Templos desbloqueados', 'NOVA AI Coach ilimitado', 'Discord exclusivo'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/40">
                    <svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/70">{f}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')}
              className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 hover:shadow-lg hover:shadow-red-500/25 transition-all active:scale-[0.98]"
            >
              Entrar ahora →
            </button>
            <p className="text-center text-[11px] text-white/20 mt-4">Pago seguro vía Whop</p>
          </div>
        </div>

        {/* FREE Card */}
        <div 
          className="flex-1 rounded-[32px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.995]"
          style={{
            background: 'linear-gradient(160deg, rgba(30,58,138,0.75) 0%, rgba(15,23,42,0.88) 50%, rgba(3,7,18,0.95) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 40px rgba(37,99,235,0.05)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.5)]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">Lista de Espera</span>
            </div>
            
            <div className="text-6xl font-bold text-white/85 mb-2 tracking-tight">Gratis</div>
            <p className="text-sm text-white/30 mb-6">tras aprobación manual</p>
            
            <div className="w-full h-px mb-6 bg-gradient-to-r from-blue-500/30 to-transparent" />
            
            <div className="space-y-3.5 mb-8">
              {['Aprobación con cuestionario', 'Templos progresivos', 'NOVA AI (10 msg/día)', 'Discord exclusivo'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-500/15 border border-blue-500/25">
                    <svg className="w-2 h-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/50">{f}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => router.push('/cuestionario')}
              className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Continuar gratis →
            </button>
          </div>
        </div>

      </div>

      {/* Trust Footer */}
      <div className="relative z-10 mt-10 flex items-center justify-center gap-4 text-white/25 text-[10px] flex-wrap px-4">
        <span className="flex items-center gap-1.5">✓ Pago seguro</span>
        <span className="w-px h-3 bg-white/10" />
        <span>✓ Sin compromisos</span>
        <span className="w-px h-3 bg-white/10" />
        <span>✓ Acceso inmediato</span>
      </div>

    </div>
  )
}
