'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface PostCompraResponse {
  id: string
  user_id: string
  valor_mensual: number
  top3_cosas: string[]
  otro_top3: string | null
  probabilidad_6_meses: number
  motivacion_seguir: string
  ayuda_portal: string
  menos_gustado: string
  preferencia_aprendizaje: string
  vida_en_2_anos: string
  created_at: string
  profiles?: {
    email: string
    full_name: string
  }
}

export default function AdminPostCompraPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<PostCompraResponse[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadResponses = useCallback(async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('post_compra_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enriquecer con perfiles (query separado para evitar error de relación)
      const responsesData = data || []
      const userIds = responsesData.map(r => r.user_id).filter(Boolean)

      let profilesById: Record<string, { email: string; full_name: string }> = {}
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)

        profilesById = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = {
            email: profile.email,
            full_name: profile.full_name
          }
          return acc
        }, {} as Record<string, { email: string; full_name: string }>)
      }

      const merged = responsesData.map(response => ({
        ...response,
        profiles: profilesById[response.user_id] || undefined
      }))

      setResponses(merged)
    } catch (error: any) {
      console.error('Error loading responses:', error)
      alert('Error al cargar respuestas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkAuthAndLoad = useCallback(async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== 'mysticcbrand@gmail.com') {
        router.push('/dashboard')
        return
      }

      await loadResponses()
    } catch (error) {
      console.error('Error:', error)
      router.push('/dashboard')
    }
  }, [router, loadResponses, supabase])

  useEffect(() => {
    checkAuthAndLoad()
  }, [checkAuthAndLoad])

  const getValorColor = (valor: number) => {
    if (valor === 0) return 'text-red-400'
    if (valor < 20) return 'text-yellow-400'
    if (valor < 50) return 'text-green-400'
    return 'text-orange-400'
  }

  const getProbabilidadColor = (prob: number) => {
    if (prob <= 3) return 'text-red-400'
    if (prob < 6) return 'text-yellow-400'
    if (prob < 8) return 'text-blue-400'
    return 'text-green-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Respuestas Post-Compra 🎁
              </h1>
              <p className="text-white/60">
                {responses.length} respuestas totales
              </p>
            </div>
            
            <button
              onClick={() => router.push('/admin/waitlist')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            >
              ← Admin Waitlist
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/60 text-sm mb-1">Valor Promedio</p>
            <p className="text-2xl font-bold text-orange-400">
              {responses.length > 0
                ? Math.round(responses.reduce((acc, r) => acc + r.valor_mensual, 0) / responses.length)
                : 0}€
            </p>
          </div>
          
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/60 text-sm mb-1">Retención Promedio</p>
            <p className="text-2xl font-bold text-green-400">
              {responses.length > 0
                ? (responses.reduce((acc, r) => acc + r.probabilidad_6_meses, 0) / responses.length).toFixed(1)
                : 0}/10
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/60 text-sm mb-1">Top Preferencia</p>
            <p className="text-lg font-semibold text-blue-400">
              {responses.length > 0 && (() => {
                const prefs = responses.map(r => r.preferencia_aprendizaje)
                const counts: Record<string, number> = {}
                prefs.forEach(p => counts[p] = (counts[p] || 0) + 1)
                const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
                return top ? top[0].split(' ')[0] : '-'
              })()}
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/60 text-sm mb-1">Última Respuesta</p>
            <p className="text-sm font-medium text-white">
              {responses.length > 0
                ? new Date(responses[0].created_at).toLocaleDateString('es-ES')
                : '-'}
            </p>
          </div>
        </div>

        {/* Responses list */}
        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-colors"
            >
              {/* Header clickable */}
              <button
                onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
                className="w-full p-6 text-left flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {response.profiles?.full_name || 'Usuario'}
                    </h3>
                    <span className="text-sm text-white/50">
                      {response.profiles?.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <span className={`font-semibold ${getValorColor(response.valor_mensual)}`}>
                      💰 {response.valor_mensual}€/mes
                    </span>
                    <span className={`font-semibold ${getProbabilidadColor(response.probabilidad_6_meses)}`}>
                      📊 {response.probabilidad_6_meses}/10 retención
                    </span>
                    <span className="text-white/50">
                      📅 {new Date(response.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                <svg 
                  className={`w-5 h-5 text-white/50 transition-transform ${expandedId === response.id ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              {expandedId === response.id && (
                <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-6">
                  {/* Top 3 Cosas */}
                  <div>
                    <p className="text-sm font-semibold text-orange-300 mb-2">
                      🎯 Top 3 cosas que mantener
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {response.top3_cosas.map((cosa, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-sm"
                        >
                          {cosa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Motivación */}
                  <div>
                    <p className="text-sm font-semibold text-blue-300 mb-2">
                      💭 ¿Qué te motivó a seguirme?
                    </p>
                    <p className="text-white/80 bg-black/20 p-3 rounded-lg">
                      {response.motivacion_seguir}
                    </p>
                  </div>

                  {/* Ayuda */}
                  <div>
                    <p className="text-sm font-semibold text-green-300 mb-2">
                      ✨ ¿A qué te ha ayudado Portal?
                    </p>
                    <p className="text-white/80 bg-black/20 p-3 rounded-lg">
                      {response.ayuda_portal}
                    </p>
                  </div>

                  {/* Menos gustado */}
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-2">
                      ⚠️ ¿Qué te gustó menos?
                    </p>
                    <p className="text-white/80 bg-black/20 p-3 rounded-lg">
                      {response.menos_gustado}
                    </p>
                  </div>

                  {/* Preferencia aprendizaje */}
                  <div>
                    <p className="text-sm font-semibold text-purple-300 mb-2">
                      📚 Preferencia de aprendizaje
                    </p>
                    <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                      {response.preferencia_aprendizaje}
                    </span>
                  </div>

                  {/* Vida en 2 años */}
                  <div>
                    <p className="text-sm font-semibold text-yellow-300 mb-2">
                      🎯 Vida en 2 años
                    </p>
                    <p className="text-white/80 bg-black/20 p-3 rounded-lg whitespace-pre-wrap">
                      {response.vida_en_2_anos}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">No hay respuestas aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
