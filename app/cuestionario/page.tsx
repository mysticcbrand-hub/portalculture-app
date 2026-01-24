'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Cuestionario() {
  const router = useRouter()

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

  // Simple redirect to login page
  const handleGoToLogin = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-black relative">
      {/* Hero-style Background - B&W (from landing) */}
      <div className="fixed inset-0 -z-10">
        {/* Primary gradient with 6 stops - anti-banding */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse 80% 60% at 50% 45%,
              rgba(255, 255, 255, 0.12) 0%,
              rgba(230, 230, 230, 0.09) 15%,
              rgba(200, 200, 200, 0.06) 30%,
              rgba(150, 150, 150, 0.04) 45%,
              rgba(100, 100, 100, 0.02) 60%,
              transparent 75%
            )`,
          }}
        />
        
        {/* Secondary gradient with 4 stops */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse 60% 40% at 70% 20%,
              rgba(180, 180, 180, 0.06) 0%,
              rgba(140, 140, 140, 0.04) 25%,
              rgba(100, 100, 100, 0.02) 50%,
              transparent 70%
            )`,
          }}
        />
        
        {/* High-quality noise for anti-banding */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.06,
            mixBlendMode: 'soft-light',
          }}
        />
      </div>

      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 gap-6">
        {/* "Ya tengo cuenta" button - goes to login page */}
        <button
          onClick={handleGoToLogin}
          className="liquid-glass-button text-sm md:text-base px-6 py-3 rounded-xl"
        >
          Ya tengo cuenta
        </button>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Lista de Espera</h1>
          <p className="text-white/60 text-sm md:text-base">Completa el cuestionario para unirte a Portal Culture</p>
        </div>

        {/* Typeform Container */}
        <div className="w-full max-w-4xl">
          {/* Mobile: Fullscreen button */}
          <div className="block md:hidden mb-4 text-center">
            <a
              href="https://form.typeform.com/to/01KDNY02YBPCQYJ5MTTVWPCZ2J"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass-primary inline-block px-6 py-3 rounded-xl text-sm"
            >
              📱 Abrir en Pantalla Completa
            </a>
          </div>

          {/* Typeform Embed */}
          <div 
            data-tf-live="01KDNY02YBPCQYJ5MTTVWPCZ2J"
            data-tf-opacity="0"
            className="w-full h-[500px] md:h-[650px] rounded-2xl overflow-hidden"
            style={{ width: '100%' }}
          />
        </div>

        {/* Footer note */}
        <p className="text-xs md:text-sm text-white/40 text-center">
          Revisaremos tu solicitud en 3-7 días · 100% gratuito
        </p>
      </div>
    </main>
  )
}
