'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TypeformEmbed() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header with logout */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Portal Culture</h1>
            {user && (
              <span className="text-sm text-white/60">
                {user.user_metadata?.name || user.email}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Typeform Embed - Full screen */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full h-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Replace with your Typeform embed */}
            <iframe
              src={`https://form.typeform.com/to/${process.env.NEXT_PUBLIC_TYPEFORM_ID}?name=${user?.user_metadata?.name || ''}&email=${user?.email || ''}`}
              className="w-full h-full"
              frameBorder="0"
              allow="camera; microphone; autoplay; encrypted-media;"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
