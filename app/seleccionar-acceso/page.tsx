'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)
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
  }, [router, supabase.auth])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isExiting) return
    setIsDragging(true)
    startX.current = e.touches[0].clientX
  }, [isExiting])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || isExiting) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    setDragX(diff)
    
    if (diff > 30) setSwipeDir('right')
    else if (diff < -30) setSwipeDir('left')
    else setSwipeDir(null)
  }, [isDragging, isExiting])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || isExiting) return
    setIsDragging(false)
    
    const threshold = 80
    if (dragX > threshold) {
      setIsExiting(true)
      setTimeout(() => {
        window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')
      }, 250)
    } else if (dragX < -threshold) {
      setIsExiting(true)
      setTimeout(() => {
        router.push('/cuestionario')
      }, 250)
    } else {
      setDragX(0)
      setSwipeDir(null)
    }
  }, [isDragging, isExiting, dragX, router])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isExiting) return
    setIsDragging(true)
    startX.current = e.clientX
  }, [isExiting])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isExiting) return
    const diff = e.clientX - startX.current
    setDragX(diff)
    
    if (diff > 30) setSwipeDir('right')
    else if (diff < -30) setSwipeDir('left')
    else setSwipeDir(null)
  }, [isDragging, isExiting])

  const handleMouseUp = useCallback(() => {
    if (!isDragging || isExiting) return
    setIsDragging(false)
    
    const threshold = 80
    if (dragX > threshold) {
      setIsExiting(true)
      setTimeout(() => {
        window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')
      }, 250)
    } else if (dragX < -threshold) {
      setIsExiting(true)
      setTimeout(() => {
        router.push('/cuestionario')
      }, 250)
    } else {
      setDragX(0)
      setSwipeDir(null)
    }
  }, [isDragging, isExiting, dragX, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getTransform = () => {
    if (isExiting) {
      return `translateX(${swipeDir === 'right' ? 400 : -400}px) rotate(${swipeDir === 'right' ? 30 : -30}deg)`
    }
    const rotate = dragX * 0.03
    return `translateX(${dragX}px) rotate(${rotate}deg)`
  }

  const getOpacity = () => {
    if (isExiting) return 0
    return 1 - Math.abs(dragX) * 0.002
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
    <div 
      className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      
      {/* Premium Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 hidden md:block" style={{
          background: `
            radial-gradient(ellipse 90% 75% at 10% 25%, rgba(220,38,38,0.25) 0%, rgba(185,28,28,0.08) 40%, transparent 70%),
            radial-gradient(ellipse 80% 70% at 90% 75%, rgba(37,99,235,0.2) 0%, rgba(29,78,216,0.06) 40%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 55%),
            #000000
          `
        }} />
        <div className="absolute inset-0 md:hidden" style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 15%, rgba(139,92,246,0.18) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 50% 90%, rgba(37,99,235,0.12) 0%, transparent 40%),
            #000000
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Elige tu acceso
        </div>
        <h1 className="text-2.5xl font-bold text-white">Portal Culture</h1>
      </div>

      {/* MOBILE: Swipeable Cards */}
      <div className="relative z-10 w-full max-w-[300px] md:hidden">
        
        {/* Direction Hints */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${swipeDir === 'left' ? 'bg-blue-500/30 border border-blue-400/40 text-blue-200 scale-105' : 'bg-white/5 border border-white/10 text-white/30'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-[10px] font-medium">Gratis</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${swipeDir === 'right' ? 'bg-red-500/30 border border-red-400/40 text-red-200 scale-105' : 'bg-white/5 border border-white/10 text-white/30'}`}>
            <span className="text-[10px] font-medium">17€</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>

        {/* Main Card (Swipeable) */}
        <div 
          ref={cardRef}
          className="relative aspect-[3/4] max-h-[420px] select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ touchAction: 'none' }}
        >
          {/* Card */}
          <div 
            className="absolute inset-0 rounded-[28px] overflow-hidden cursor-grab active:cursor-grabbing"
            style={{
              transform: getTransform(),
              opacity: getOpacity(),
              transition: isExiting ? 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
              zIndex: 10,
            }}
          >
            {/* Glassmorphism Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(145deg, rgba(127,29,29,0.75) 0%, rgba(69,10,10,0.9) 50%, rgba(20,5,5,0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 60px rgba(220,38,38,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            />
            
            {/* Swipe Direction Overlay */}
            {swipeDir === 'right' && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" style={{ background: 'rgba(220,38,38,0.15)' }}>
                <div className="px-6 py-3 rounded-2xl border-2 border-red-400/60 bg-red-500/20 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-red-300">17€</span>
                </div>
              </div>
            )}
            {swipeDir === 'left' && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" style={{ background: 'rgba(37,99,235,0.15)' }}>
                <div className="px-6 py-3 rounded-2xl border-2 border-blue-400/60 bg-blue-500/20 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-blue-300">Gratis</span>
                </div>
              </div>
            )}
            
            {/* Shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            {/* Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="px-2.5 py-1 rounded-full text-[9px] font-semibold"
                style={{ 
                  background: 'rgba(220,38,38,0.25)', 
                  border: '1px solid rgba(239,68,68,0.5)', 
                  color: '#fca5a5',
                  boxShadow: '0 0 20px rgba(220,38,38,0.25)',
                }}>
                ⚡ Popular
              </div>
            </div>

            <div className="relative h-full p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Acceso</span>
              </div>
              
              <div className="text-4xl font-bold text-white mb-1">17€</div>
              <p className="text-xs text-white/35 mb-4">pago único</p>
              
              <div className="w-full h-px mb-4 bg-gradient-to-r from-red-500/40 to-transparent" />
              
              <div className="flex-1 space-y-2.5">
                {['✓ Acceso inmediato', '✓ 5 Templos', '✓ NOVA ilimitado', '✓ Discord exclusivo'].map((f, i) => (
                  <p key={i} className="text-xs text-white/65">{f}</p>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer') }}
                className="w-full py-3.5 mt-4 rounded-2xl text-xs font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
                }}
              >
                Acceso 17€ →
              </button>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="text-center mt-4 space-y-1">
          <p className="text-white/50 text-[11px]">Desliza para elegir</p>
          <div className="flex justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
          </div>
        </div>
      </div>

      {/* DESKTOP: Premium Cards */}
      <div className="relative z-10 w-full max-w-4xl hidden md:flex gap-5">
        
        {/* PAID Card */}
        <div 
          onClick={() => window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')}
          className="flex-1 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(145deg, rgba(127,29,29,0.6) 0%, rgba(69,10,10,0.8) 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6), 0 0 50px rgba(220,38,38,0.1)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <div className="absolute top-5 right-5">
            <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-red-500/20 border border-red-500/40 text-red-300">⚡ Popular</span>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Acceso Inmediato</span>
            </div>
            
            <div className="text-5xl font-bold text-white mb-2">17€</div>
            <p className="text-sm text-white/40 mb-6">pago único · sin suscripción</p>
            
            <div className="w-full h-px mb-6 bg-gradient-to-r from-red-500/40 to-transparent" />
            
            <div className="space-y-3 mb-8">
              {['Acceso completo inmediato', 'Sin espera ni aprobación', '5 Templos desbloqueados', 'NOVA AI Coach ilimitado', 'Discord exclusivo'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/40">
                    <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/70">{f}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 hover:shadow-lg hover:shadow-red-500/20">
              Entrar ahora →
            </button>
            <p className="text-center text-[11px] text-white/20 mt-3">Pago seguro vía Whop</p>
          </div>
        </div>

        {/* FREE Card */}
        <div 
          onClick={() => router.push('/cuestionario')}
          className="flex-1 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(145deg, rgba(30,58,95,0.6) 0%, rgba(15,23,42,0.8) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Lista de Espera</span>
            </div>
            
            <div className="text-5xl font-bold text-white/80 mb-2">Gratis</div>
            <p className="text-sm text-white/30 mb-6">tras aprobación manual</p>
            
            <div className="w-full h-px mb-6 bg-gradient-to-r from-blue-500/30 to-transparent" />
            
            <div className="space-y-3 mb-8">
              {['Aprobación con cuestionario', 'Templos progresivos', 'NOVA AI (10 msg/día)', 'Discord exclusivo'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-500/15 border border-blue-500/25">
                    <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-white/50">{f}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/20">
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
