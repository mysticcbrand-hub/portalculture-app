'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface WaitlistEntry {
  id: string
  email: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  approved_at: string | null
  metadata: any
}

export default function AdminWaitlistPage() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadEntries()
    }
  }, [filter, loading])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'mysticcbrand@gmail.com') {
      router.push('/dashboard')
      return
    }
    
    setLoading(false)
  }

  const loadEntries = async () => {
    let query = supabase
      .from('waitlist')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading waitlist:', error)
      return
    }

    setEntries(data || [])
  }

  const handleApprove = async (entry: WaitlistEntry) => {
    setProcessing(entry.id)
    
    try {
      // 1. Update status in Supabase
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', entry.id)

      if (updateError) throw updateError

      // 2. Send to Mailerlite
      const response = await fetch('/api/mailerlite/add-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: entry.email,
          name: entry.name
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error adding to Mailerlite')
      }

      // 3. Reload entries
      await loadEntries()
      
      alert(`✅ ${entry.name} ha sido aprobado y añadido a Mailerlite`)
    } catch (error: any) {
      console.error('Error approving entry:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (entry: WaitlistEntry) => {
    if (!confirm(`¿Rechazar la solicitud de ${entry.name}?`)) return
    
    setProcessing(entry.id)
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .update({ status: 'rejected' })
        .eq('id', entry.id)

      if (error) throw error

      await loadEntries()
      alert(`${entry.name} ha sido rechazado`)
    } catch (error: any) {
      console.error('Error rejecting entry:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              PORTAL CULTURE
            </h1>
            <p className="text-sm text-gray-400">Panel de Administración</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm glass glass-hover rounded-xl"
            >
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm glass glass-hover rounded-xl"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Lista de Espera</h2>
          <p className="text-gray-400">Gestiona las solicitudes de acceso a Portal Culture</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === f
                  ? 'bg-white text-black'
                  : 'glass glass-hover'
              }`}
            >
              {f === 'all' && 'Todas'}
              {f === 'pending' && `Pendientes (${entries.length})`}
              {f === 'approved' && 'Aprobadas'}
              {f === 'rejected' && 'Rechazadas'}
            </button>
          ))}
        </div>

        {/* Entries list */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <p className="text-gray-400">No hay solicitudes en esta categoría</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="glass rounded-3xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{entry.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        entry.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {entry.status === 'pending' ? 'Pendiente' :
                         entry.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-1">{entry.email}</p>
                    <p className="text-sm text-gray-500">
                      Enviado: {new Date(entry.submitted_at).toLocaleString('es-ES')}
                    </p>
                    {entry.approved_at && (
                      <p className="text-sm text-gray-500">
                        Aprobado: {new Date(entry.approved_at).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>

                  {entry.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(entry)}
                        disabled={processing === entry.id}
                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all disabled:opacity-50"
                      >
                        {processing === entry.id ? 'Procesando...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleReject(entry)}
                        disabled={processing === entry.id}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>

                {/* Show metadata if available */}
                {entry.metadata?.answers && Array.isArray(entry.metadata.answers) && entry.metadata.answers.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                      Ver respuestas del cuestionario
                    </summary>
                    <div className="mt-3 p-4 bg-white/5 rounded-xl space-y-2">
                      {entry.metadata.answers.map((answer: any, idx: number) => {
                        // Extraer el valor de la respuesta de forma segura
                        let answerValue = 'N/A'
                        
                        if (answer.text) {
                          answerValue = String(answer.text)
                        } else if (answer.email) {
                          answerValue = String(answer.email)
                        } else if (answer.number !== undefined && answer.number !== null) {
                          answerValue = String(answer.number)
                        } else if (answer.boolean !== undefined) {
                          answerValue = answer.boolean ? 'Sí' : 'No'
                        } else if (answer.choice) {
                          // Choice puede ser string u objeto con label/labels
                          if (typeof answer.choice === 'string') {
                            answerValue = answer.choice
                          } else if (answer.choice.label) {
                            answerValue = answer.choice.label
                          } else if (answer.choice.labels && Array.isArray(answer.choice.labels)) {
                            answerValue = answer.choice.labels.join(', ')
                          }
                        } else if (answer.choices && Array.isArray(answer.choices)) {
                          // Múltiples choices
                          answerValue = answer.choices.map((c: any) => 
                            typeof c === 'string' ? c : c.label || c
                          ).join(', ')
                        } else if (answer.phone_number) {
                          answerValue = String(answer.phone_number)
                        } else if (answer.url) {
                          answerValue = String(answer.url)
                        } else if (answer.date) {
                          answerValue = String(answer.date)
                        } else if (typeof answer === 'string') {
                          answerValue = answer
                        }
                        
                        // Extraer label de forma segura (puede ser objeto)
                        let questionLabel = `Pregunta ${idx + 1}`
                        if (typeof answer.field?.label === 'string') {
                          questionLabel = answer.field.label
                        } else if (typeof answer.field?.title === 'string') {
                          questionLabel = answer.field.title
                        } else if (answer.field?.ref) {
                          questionLabel = `Campo: ${answer.field.ref}`
                        } else if (answer.type) {
                          questionLabel = `${answer.type} (${idx + 1})`
                        }
                        
                        return (
                          <div key={idx} className="text-sm">
                            <p className="text-gray-400">{questionLabel}</p>
                            <p className="text-white">{answerValue}</p>
                          </div>
                        )
                      })}
                    </div>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
