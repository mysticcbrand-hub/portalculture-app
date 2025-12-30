import { createClient } from '@supabase/supabase-js'

// Force clean initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Clean URL - ensure no trailing slashes or weird characters
const cleanUrl = supabaseUrl.trim().replace(/\/+$/, '')

console.log('Initializing Supabase client:', {
  url: cleanUrl,
  keyLength: supabaseAnonKey.length,
  keyStart: supabaseAnonKey.substring(0, 20)
})

export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'portal-culture'
    }
  }
})
