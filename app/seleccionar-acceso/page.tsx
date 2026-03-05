'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SeleccionarAcceso() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [shuffling, setShuffling] = useState(false)
  const [showPaid, setShowPaid] = useState(true)
  
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

  const handleShuffle = useCallback((type: 'paid' | 'free') => {
    if (shuffling) return
    setShuffling(true)
    
    let count = 0
    const shuffle = () => {
      count++
      setShowPaid(prev => !prev)
      
      if (count < 6) {
        setTimeout(shuffle, 100)
      } else {
        setShuffling(false)
        if (type === 'paid') {
          window.open('https://whop.com/portalculture/acceso-inmediato', '_blank', 'noopener,noreferrer')
        } else {
          router.push('/cuestionario')
        }
      }
    }
    setTimeout(shuffle, 100)
  }, [shuffling, router])

  const handleFastPass = () => handleShuffle('paid')
  const handleWaitlist = () => handleShuffle('free')
  
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
      
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      {/* Logout */}
      <button onClick={handleLogout} className="fixed top-4 right-4 z-50">
        <div className="px-3 py-2 bg-white/10 rounded-full">✕</div>
      </button>

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs mb-3">
          Elige tu acceso
        </div>
        <h1 className="text-3xl font-bold text-white">Portal Culture</h1>
      </div>

      {/* MOBILE: Card Stack */}
      <div className="relative z-10 w-full max-w-[320px] md:hidden">
        
        <div className="relative h-[360px]">
          
          {/* Card FREE (Behind) */}
          <div 
            className="absolute left-0 right-0 top-3 rounded-3xl p-4"
            style={{
              background: 'linear-gradient(165deg, #1e3a5f 0%, #0f172a 100%)',
              border: '1px solid rgba(59,130,246,0.3)',
              transform: `scale(${showPaid ? 0.85 : 1}) translateY(${showPaid ? 20 : 0}px)`,
              opacity: showPaid ? 0.4 : 1,
              zIndex: showPaid ? 1 : 10,
              transition: 'all 0.2s ease',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-blue-400 uppercase">Lista de Espera</span>
            </div>
            <div className="text-3xl font-bold text-white/80 mb-1">Gratis</div>
            <p className="text-xs text-white/40 mb-3">tras aprobación</p>
            
            <div className="space-y-2 mb-4">
              <p className="text-xs text-white/50">✓ Aprobación manual</p>
              <p className="text-xs text-white/50">✓ Templos progresivos</p>
              <p className="text-xs text-white/50">✓ NOVA 10 msg/día</p>
            </div>

            <button
              onClick={handleWaitlist}
              disabled={shuffling}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500"
            >
              {shuffling ? '...' : 'Solicitar Gratis'}
            </button>
          </div>

          {/* Card PAID (Front) */}
          <div 
            className="absolute left-0 right-0 top-0 rounded-3xl p-4"
            style={{
              background: 'linear-gradient(165deg, #7f1d1d 0%, #450a0a 100%)',
              border: '1px solid rgba(239,68,68,0.3)',
              transform: `scale(${showPaid ? 1 : 0.85}) translateY(${showPaid ? 0 : 20}px)`,
              opacity: showPaid ? 1 : 0.4,
              zIndex: showPaid ? 10 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(220,38,38,0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-400 uppercase">Acceso</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] text-red-300">⚡ Popular</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">17€</div>
            <p className="text-xs text-white/40 mb-3">pago único</p>
            
            <div className="space-y-2 mb-4">
              <p className="text-xs text-white/70">✓ Acceso inmediato</p>
              <p className="text-xs text-white/70">✓ 5 Templos</p>
              <p className="text-xs text-white/70">✓ NOVA ilimitado</p>
              <p className="text-xs text-white/70">✓ Discord</p>
            </div>

            <button
              onClick={handleFastPass}
              disabled={shuffling}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white"
            >
              {shuffling ? '...' : 'Acceso 17€ →'}
            </button>
          </div>

        </div>

        <p className="text-center text-white/40 text-xs mt-4">
          {shuffling ? 'Eligiendo...' : 'Toca para elegir'}
        </p>
      </div>

      {/* DESKTOP: Simple Cards */}
      <div className="relative z-10 w-full max-w-4xl hidden md:flex gap-6">
        
        {/* PAID Card */}
        <div 
          onClick={handleFastPass}
          className="flex-1 rounded-3xl p-8 cursor-pointer hover:scale-[1.02] transition-transform"
          style={{
            background: 'linear-gradient(165deg, #7f1d1d 0%, #450a0a 100%)',
            border: '1px solid rgba(239,68,68,0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-400 uppercase">Acceso Inmediato</span>
          </div>
          <div className="text-5xl font-bold text-white mb-2">17€</div>
          <p className="text-sm text-white/40 mb-6">pago único</p>
          
          <div className="space-y-3 mb-6">
            <p className="text-sm text-white/70">✓ Acceso inmediato</p>
            <p className="text-sm text-white/70">✓ 5 Templos</p>
            <p className="text-sm text-white/70">✓ NOVA ilimitado</p>
            <p className="text-sm text-white/70">✓ Discord</p>
          </div>

          <button className="w-full py-4 rounded-2xl font-semibold bg-red-600 text-white">
            Entrar ahora →
          </button>
        </div>

        {/* FREE Card */}
        <div 
          onClick={handleWaitlist}
          className="flex-1 rounded-3xl p-8 cursor-pointer hover:scale-[1.02] transition-transform"
          style={{
            background: 'linear-gradient(165deg, #1e3a5f 0%, #0f172a 100%)',
            border: '1px solid rgba(59,130,246,0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-400 uppercase">Lista de Espera</span>
          </div>
          <div className="text-5xl font-bold text-white/80 mb-2">Gratis</div>
          <p className="text-sm text-white/30 mb-6">tras aprobación</p>
          
          <div className="space-y-3 mb-6">
            <p className="text-sm text-white/50">✓ Aprobación manual</p>
            <p className="text-sm text-white/50">✓ Templos progresivos</p>
            <p className="text-sm text-white/50">✓ NOVA 10 msg/día</p>
          </div>

          <button className="w-full py-4 rounded-2xl font-semibold bg-blue-600 text-white">
            Continuar gratis →
          </button>
        </div>

      </div>

      {/* Trust */}
      <div className="relative z-10 mt-8 text-white/30 text-xs flex items-center gap-4">
        <span>✓ Pago seguro</span>
        <span>✓ Sin compromisos</span>
      </div>

    </div>
  )
}
