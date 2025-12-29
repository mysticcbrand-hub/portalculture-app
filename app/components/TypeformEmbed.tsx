'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Script from 'next/script'

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
      {/* Typeform Embed Script */}
      <Script src="//embed.typeform.com/next/embed.js" strategy="lazyOnload" />

      {/* Header with logout */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
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
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Typeform Embed - Full screen with custom styling */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full h-full max-w-5xl">
            {/* Typeform Widget Container */}
            <div 
              data-tf-live="01KDNY02YBPCQYJ5MTTVWPCZ2J"
              data-tf-hidden={`name=${user?.user_metadata?.name || ''},email=${user?.email || ''}`}
              data-tf-opacity="0"
              data-tf-iframe-props="title=Portal Culture Form"
              data-tf-transitive-search-params
              data-tf-medium="snippet"
              className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ 
                height: 'calc(100vh - 140px)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
