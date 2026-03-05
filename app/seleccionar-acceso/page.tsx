'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      setActiveIndex(prev => diff > 0 ? Math.min(prev + 1, 1) : Math.max(prev - 1, 0))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const diff = startX.current - e.clientX
    if (Math.abs(diff) > 60) {
      setActiveIndex(prev => diff > 0 ? Math.min(prev + 1, 1) : Math.max(prev - 1, 0))
    }
  }

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

  const cards = [
    {
      type: 'paid',
      title: 'Acceso',
      price: '17€',
      subtitle: 'pago único',
      color: 'red',
      features: ['✓ Acceso inmediato', '✓ 5 Templos', '✓ NOVA ilimitado', '✓ Discord exclusivo'],
      button: 'Acceso 17€ →',
      action: () => window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer'),
    },
    {
      type: 'free',
      title: 'Lista de Espera',
      price: 'Gratis',
      subtitle: 'tras aprobación manual',
      color: 'blue',
      features: ['✓ Aprobación manual', '✓ Templos progresivos', '✓ NOVA 10 msg/día', '✓ Discord exclusivo'],
      button: 'Solicitar Gratis',
      action: () => router.push('/cuestionario'),
    }
  ]

  const activeCard = cards[activeIndex]

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
      
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 hidden md:block" style={{
          background: `
            radial-gradient(ellipse 90% 75% at 10% 25%, rgba(220,38,38,0.35) 0%, rgba(185,28,28,0.12) 40%, transparent 70%),
            radial-gradient(ellipse 80% 70% at 90% 75%, rgba(37,99,235,0.3) 0%, rgba(29,78,216,0.1) 40%, transparent 70%),
            #000000
          `
        }} />
        <div className="absolute inset-0 md:hidden" style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 8%, rgba(139,92,246,0.35) 0%, transparent 50%),
            radial-gradient(ellipse 90% 60% at 50% 95%, ${activeCard.type === 'paid' ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.2)'} 0%, transparent 45%),
            #000000
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          opacity: 0.035,
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
      <div className="relative z-10 text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Portal Culture</h1>
      </div>

      {/* Cards Container - Horizontal Swipe */}
      <div 
        ref={containerRef}
        className="relative z-10 w-full max-w-[340px] md:hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Active Card */}
        <div 
          className="w-full aspect-[3/4] rounded-[28px] overflow-hidden"
          style={{
            transform: 'scale(1)',
            opacity: 1,
            transition: 'all 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* Glassmorphism */}
          <div 
            className="absolute inset-0"
            style={{
              background: activeCard.type === 'paid'
                ? 'linear-gradient(160deg, rgba(153,27,27,0.9) 0%, rgba(69,10,10,0.95) 50%, rgba(0,0,0,0.98) 100%)'
                : 'linear-gradient(160deg, rgba(30,64,175,0.85) 0%, rgba(15,23,42,0.95) 50%, rgba(0,0,0,0.98) 100%)',
              backdropFilter: 'blur(24px) saturate(150%)',
              WebkitBackdropFilter: 'blur(24px) saturate(150%)',
              border: activeCard.type === 'paid'
                ? '1px solid rgba(239,68,68,0.35)'
                : '1px solid rgba(59,130,246,0.3)',
              boxShadow: activeCard.type === 'paid'
                ? '0 35px 60px -15px rgba(0,0,0,0.6), 0 0 50px rgba(220,38,38,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 35px 60px -15px rgba(0,0,0,0.6), 0 0 40px rgba(37,99,235,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          />
          
          {/* Shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Badge */}
          {activeCard.type === 'paid' && (
            <div className="absolute top-5 right-5 z-10">
              <div 
                className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase"
                style={{
                  background: 'rgba(220,38,38,0.35)',
                  border: '1px solid rgba(239,68,68,0.5)',
                  color: '#fca5a5',
                  boxShadow: '0 0 20px rgba(220,38,38,0.3)',
                }}
              >
                ⚡ Popular
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="relative h-full p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: activeCard.type === 'paid' ? '#ef4444' : '#60a5fa',
                  boxShadow: `0 0 12px ${activeCard.type === 'paid' ? 'rgba(239,68,68,0.6)' : 'rgba(96,165,250,0.6)'}`,
                }}
              />
              <span 
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: activeCard.type === 'paid' ? '#f87171' : '#60a5fa' }}
              >
                {activeCard.title}
              </span>
            </div>
            
            <div className="text-[3.5rem] font-bold text-white mb-1 tracking-tight leading-none">
              {activeCard.price}
            </div>
            <p className="text-xs text-white/35 mb-5">{activeCard.subtitle}</p>
            
            <div className="w-full h-px mb-5 bg-gradient-to-r from-white/10 to-transparent" />
            
            <div className="flex-1 space-y-3">
              {activeCard.features.map((f, i) => (
                <p key={i} className="text-xs text-white/60">{f}</p>
              ))}
            </div>

            <button
              onClick={activeCard.action}
              className="w-full py-3.5 mt-4 rounded-2xl text-xs font-semibold text-white transition-all active:scale-[0.97]"
              style={{
                background: activeCard.type === 'paid'
                  ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: activeCard.type === 'paid'
                  ? '0 8px 25px rgba(220,38,38,0.4)'
                  : '0 8px 25px rgba(37,99,235,0.3)',
              }}
            >
              {activeCard.button}
            </button>
          </div>
        </div>
        
        {/* Page Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="transition-all duration-300"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: i === activeIndex 
                    ? (i === 0 ? '#ef4444' : '#60a5fa')
                    : 'rgba(255,255,255,0.2)',
                  transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: i === activeIndex 
                    ? `0 0 10px ${i === 0 ? 'rgba(239,68,68,0.5)' : 'rgba(96,165,250,0.5)'}`
                    : 'none',
                }}
              />
            </button>
          ))}
        </div>
        
        {/* Swipe Hint */}
        <div className="flex justify-center items-center gap-2 mt-3 text-white/25 text-[10px]">
          <span className="animate-pulse opacity-50">←</span>
          <span>Desliza</span>
          <span className="animate-pulse opacity-50">→</span>
        </div>
      </div>

      {/* DESKTOP - Both cards side by side */}
      <div className="relative z-10 w-full max-w-5xl hidden md:flex gap-6 px-4">
        
        {/* PAID */}
        <div 
          className="flex-1 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.995]"
          style={{
            background: 'linear-gradient(160deg, rgba(153,27,27,0.85) 0%, rgba(69,10,10,0.92) 50%, rgba(20,5,5,0.95) 100%)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(239,68,68,0.3)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(220,38,38,0.12)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <div className="absolute top-6 right-6">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase bg-red-500/25 border border-red-500/45 text-red-300">⚡ Popular</span>
          </div>

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Acceso Inmediato</span>
            </div>
            
            <div className="text-6xl font-bold text-white mb-2">17€</div>
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

        {/* FREE */}
        <div 
          className="flex-1 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.995]"
          style={{
            background: 'linear-gradient(160deg, rgba(30,64,175,0.8) 0%, rgba(15,23,42,0.9) 50%, rgba(3,7,18,0.95) 100%)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(59,130,246,0.25)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 40px rgba(37,99,235,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Lista de Espera</span>
            </div>
            
            <div className="text-6xl font-bold text-white/85 mb-2">Gratis</div>
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

      {/* Trust */}
      <div className="relative z-10 mt-8 flex items-center justify-center gap-4 text-white/25 text-[10px] flex-wrap px-4">
        <span className="flex items-center gap-1.5">✓ Pago seguro</span>
        <span className="w-px h-3 bg-white/10" />
        <span>✓ Sin compromisos</span>
        <span className="w-px h-3 bg-white/10" />
        <span>✓ Acceso inmediato</span>
      </div>

    </div>
  )
}
