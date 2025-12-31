import { createBrowserClient } from '@supabase/ssr'
import { config } from '@/lib/config'

export function createClient() {
  const supabaseUrl = config.supabase.url
  const supabaseAnonKey = config.supabase.anonKey

  console.log('✅ Using config:', supabaseUrl)
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
