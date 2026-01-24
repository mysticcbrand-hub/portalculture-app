'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeleccionarAcceso() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFreeAccess = () => {
    window.open('https://whop.com/checkout/plan_2kXdGgagLpw4A', '_blank')
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-900/50" />
      
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

      <div 
        className={`
          relative z-10 w-full max-w-md text-center
          transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-medium text-white mb-2">
          Bienvenido a Portal Culture
        </h1>
        <p className="text-sm text-white/50 mb-8">
          Selecciona cómo quieres continuar
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Free Access */}
          <button
            onClick={handleFreeAccess}
            className="w-full p-4 bg-white text-black rounded-xl hover:bg-white/90 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-sm">Acceso Gratuito</p>
                <p className="text-xs text-black/50">Accede a Discord y comunidad</p>
              </div>
              <svg className="w-5 h-5 text-black/40 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="w-full p-4 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-sm">Saltar pruebas</p>
                <p className="text-xs text-white/40">Ir directamente al dashboard</p>
              </div>
              <svg className="w-5 h-5 text-white/30 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-white/20 mt-8">
          © 2026 Portal Culture
        </p>
      </div>
    </div>
  )
}
