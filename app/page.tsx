'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      {/* Typeform Script */}
      <Script src="//embed.typeform.com/next/embed.js" strategy="afterInteractive" />
      
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            PORTAL CULTURE
          </h1>
          <Link
            href="/login"
            className="text-xs md:text-sm glass glass-hover px-3 md:px-4 py-1.5 md:py-2 rounded-xl"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </header>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 -z-10" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />

      {/* Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {!submitted ? (
            <>
              <div className="glass rounded-2xl md:rounded-3xl p-6 md:p-8 mb-4 md:mb-6 text-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Únete a Portal Culture</h2>
                <p className="text-gray-400 text-base md:text-lg mb-3 md:mb-4">
                  Comunidad exclusiva de desarrollo personal y crecimiento
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  Completa este breve cuestionario para solicitar acceso. Revisamos cada solicitud manualmente 
                  y te contactaremos por email en las próximas 24-48 horas.
                </p>
              </div>

              {/* Typeform embed - Desktop: inline, Mobile: popup */}
              {isMobile ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2">Cuestionario de Acceso</h3>
                    <p className="text-gray-400 text-sm">
                      Completa el formulario en pantalla completa para una mejor experiencia
                    </p>
                  </div>
                  <button
                    data-tf-popup="01KDNY02YBPCQYJ5MTTVWPCZ2J"
                    data-tf-opacity="100"
                    data-tf-size="100"
                    data-tf-iframe-props="title=Portal Culture Application"
                    data-tf-transitive-search-params
                    data-tf-medium="snippet"
                    className="w-full px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Comenzar Cuestionario
                  </button>
                </div>
              ) : (
                <div className="glass rounded-3xl overflow-hidden" style={{ height: '650px' }}>
                  <div 
                    data-tf-live="01KDNY02YBPCQYJ5MTTVWPCZ2J"
                    data-tf-opacity="0"
                    data-tf-iframe-props="title=Portal Culture Application"
                    data-tf-transitive-search-params
                    data-tf-medium="snippet"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              )}

              <div className="mt-4 md:mt-6 text-center">
                <p className="text-xs md:text-sm text-gray-500">
                  Al completar el cuestionario, tu solicitud será revisada por nuestro equipo.
                </p>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">¡Solicitud Enviada!</h2>
              <p className="text-gray-400 text-base md:text-lg mb-4 md:mb-6">
                Gracias por tu interés en Portal Culture. Revisaremos tu solicitud y te contactaremos 
                por email en las próximas 24-48 horas.
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Revisa tu bandeja de entrada (y spam) para recibir tu invitación.
              </p>
            </div>
          )}
        </div>
      </main>

        <footer className="text-center text-xs text-gray-500 p-4 md:p-6">
          © 2025 Portal Culture. Todos los derechos reservados.
        </footer>
      </div>
    </>
  )
}
