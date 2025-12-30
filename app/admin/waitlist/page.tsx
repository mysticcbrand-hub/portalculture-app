'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface WaitlistUser {
  id: string
  email: string
  name: string
  status: string
  submitted_at: string
  approved_at: string | null
  metadata: Record<string, unknown>
}

export default function AdminWaitlist() {
  const router = useRouter()
  const [pending, setPending] = useState<WaitlistUser[]>([])
  const [approved, setApproved] = useState<WaitlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Verificar que el usuario esté logueado y sea admin
    supabase.auth.getUser().then(({ data: { user }, error: authError }) => {
      console.log('Auth check:', { user, error: authError })
      
      if (authError) {
        console.error('Auth error:', authError)
        setError(`Error de autenticación: ${authError.message}`)
        return
      }
      
      if (!user) {
        console.log('No user found, redirecting to home')
        setError('No hay usuario logueado')
        setTimeout(() => router.push('/'), 2000)
        return
      }
      
      setUserEmail(user.email || '')
      console.log('User email:', user.email)
      
      if (user.email !== 'mysticcbrand@gmail.com') {
        console.log('User is not admin:', user.email)
        setError(`Usuario no autorizado: ${user.email}. Solo mysticcbrand@gmail.com puede acceder.`)
        setTimeout(() => router.push('/'), 2000)
        return
      }
      
      console.log('User is admin, loading waitlist')
      loadWaitlist()
    })
  }, [router])

  const loadWaitlist = async () => {
    setLoading(true)
    
    try {
      // Cargar pendientes
      const { data: pendingData, error: pendingError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
      
      if (pendingError) {
        console.error('Error loading pending:', pendingError)
        setError(`Error cargando pendientes: ${pendingError.message}`)
      }
      
      // Cargar aprobados
      const { data: approvedData, error: approvedError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
      
      if (approvedError) {
        console.error('Error loading approved:', approvedError)
        setError(`Error cargando aprobados: ${approvedError.message}`)
      }
      
      setPending(pendingData || [])
      setApproved(approvedData || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(`Error inesperado: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (user: WaitlistUser) => {
    setProcessing(user.id)
    
    try {
      const response = await fetch('/api/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al aprobar usuario')
      }
      
      // Recargar lista
      await loadWaitlist()
      
      alert(`✅ ${user.name} ha sido aprobado y se le envió el email!`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setProcessing(null)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-8">
        <div className="max-w-2xl w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">❌ Error de Acceso</h1>
          <p className="text-white/80 mb-4">{error}</p>
          <div className="text-sm text-white/40 mb-4">
            <p>Email detectado: <span className="text-white/60">{userEmail || 'Ninguno'}</span></p>
            <p>Email requerido: <span className="text-white/60">mysticcbrand@gmail.com</span></p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-white/60">Portal Culture - Lista de Espera</p>
            <p className="text-white/40 text-sm mt-1">Logueado como: {userEmail}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg
                     text-white hover:bg-white/10 transition"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Pending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Pendientes de Aprobación ({pending.length})
            </h2>
            <button
              onClick={loadWaitlist}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-white/60 hover:text-white hover:bg-white/10 transition text-sm"
            >
              ↻ Recargar
            </button>
          </div>

          {pending.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <p className="text-white/40">No hay usuarios pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((user) => (
                <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-6
                                             hover:bg-white/[0.07] transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{user.name}</h3>
                      <p className="text-white/60 mb-3">{user.email}</p>
                      <div className="flex gap-4 text-sm text-white/40">
                        <span>📅 {new Date(user.submitted_at).toLocaleString('es-ES')}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => approveUser(user)}
                      disabled={processing === user.id}
                      className="px-8 py-4 bg-green-500/20 border border-green-500/40 rounded-xl
                               text-green-400 hover:bg-green-500/30 transition font-semibold
                               disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processing === user.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>✓ Aprobar</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Aprobados ({approved.length})
          </h2>

          {approved.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <p className="text-white/40">Aún no has aprobado a nadie</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map((user) => (
                <div key={user.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-semibold">{user.name}</h4>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right text-sm text-green-400">
                      <div>✓ Aprobado</div>
                      <div className="text-white/40 text-xs">
                        {user.approved_at && new Date(user.approved_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
