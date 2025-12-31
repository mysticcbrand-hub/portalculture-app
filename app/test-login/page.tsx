'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Intentando login directo...')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Login directo con fetch a Supabase REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          email,
          password,
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error_description || data.message || 'Error en login')
      }

      console.log('✅ Login exitoso!')
      alert('¡Login exitoso! Token: ' + data.access_token?.substring(0, 20) + '...')
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8">
          <h1 className="text-2xl font-bold mb-6">TEST LOGIN (Fetch Directo)</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-all text-white"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-all text-white"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar Login Directo'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-gray-400 hover:text-white">
              Volver al login normal
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
