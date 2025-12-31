'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CuestionarioPage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }
      
      setUserEmail(user.email || null)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            PORTAL CULTURE
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 mb-6">
            <h2 className="text-3xl font-bold mb-4">Cuestionario de ingreso</h2>
            <p className="text-gray-400 mb-6">
              Para formar parte de Portal Culture, completa este breve cuestionario. 
              Una vez revisado por nuestro equipo, recibirás un email con acceso completo a la plataforma.
            </p>
            {userEmail && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                <p className="text-sm text-gray-400">
                  Registrado como: <span className="text-white font-medium">{userEmail}</span>
                </p>
              </div>
            )}
          </div>

          {/* Typeform embed */}
          <div className="glass rounded-3xl overflow-hidden" style={{ height: '650px' }}>
            <iframe
              src={`https://form.typeform.com/to/${process.env.NEXT_PUBLIC_TYPEFORM_ID}?email=${userEmail}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="camera; microphone; autoplay; encrypted-media;"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Al completar el cuestionario, tu solicitud será revisada en las próximas 24-48 horas.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
