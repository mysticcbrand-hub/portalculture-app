'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Cuestionario() {
  useEffect(() => {
    // Load Typeform embed script
    const script = document.createElement('script')
    script.src = '//embed.typeform.com/next/embed.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>
      </div>

      {/* Header text */}
      <div className="text-center px-4 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Lista de Espera</h1>
        <p className="text-white/50 text-sm md:text-base">Completa el cuestionario para unirte a Portal Culture</p>
      </div>

      {/* Typeform embed - full height */}
      <div className="flex-1 min-h-[500px]">
        <div 
          data-tf-live="01KDNY02YBPCQYJ5MTTVWPCZ2J"
          data-tf-opacity="0"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Footer note */}
      <div className="p-4 text-center">
        <p className="text-xs text-white/30">
          Revisaremos tu solicitud en 3-7 días · 100% gratuito
        </p>
      </div>
    </main>
  )
}
