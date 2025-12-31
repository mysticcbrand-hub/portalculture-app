'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            PORTAL CULTURE
          </h1>
          <Link
            href="/login"
            className="text-sm glass glass-hover px-4 py-2 rounded-xl"
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
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {!submitted ? (
            <>
              <div className="glass rounded-3xl p-8 mb-6 text-center">
                <h2 className="text-4xl font-bold mb-4">Únete a Portal Culture</h2>
                <p className="text-gray-400 text-lg mb-4">
                  Comunidad exclusiva de desarrollo personal y crecimiento
                </p>
                <p className="text-gray-500 text-sm">
                  Completa este breve cuestionario para solicitar acceso. Revisamos cada solicitud manualmente 
                  y te contactaremos por email en las próximas 24-48 horas.
                </p>
              </div>

              {/* Typeform embed */}
              <div className="glass rounded-3xl overflow-hidden" style={{ height: '650px' }}>
                <iframe
                  src={`https://form.typeform.com/to/${process.env.NEXT_PUBLIC_TYPEFORM_ID}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="camera; microphone; autoplay; encrypted-media;"
                  onLoad={() => {
                    // Detectar cuando se completa el formulario (opcional)
                  }}
                />
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Al completar el cuestionario, tu solicitud será revisada por nuestro equipo.
                </p>
              </div>
            </>
          ) : (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">¡Solicitud Enviada!</h2>
              <p className="text-gray-400 text-lg mb-6">
                Gracias por tu interés en Portal Culture. Revisaremos tu solicitud y te contactaremos 
                por email en las próximas 24-48 horas.
              </p>
              <p className="text-sm text-gray-500">
                Revisa tu bandeja de entrada (y spam) para recibir tu invitación.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 p-6">
        © 2025 Portal Culture. Todos los derechos reservados.
      </footer>
    </div>
  )
}
