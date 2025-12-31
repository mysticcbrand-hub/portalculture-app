import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug: Ver valores exactos
  console.log('🔍 Supabase Client Creation:')
  console.log('URL:', supabaseUrl)
  console.log('URL type:', typeof supabaseUrl)
  console.log('URL length:', supabaseUrl?.length)
  console.log('Key:', supabaseAnonKey?.substring(0, 50) + '...')
  console.log('Key type:', typeof supabaseAnonKey)
  console.log('Key length:', supabaseAnonKey?.length)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables. Check Vercel settings.')
  }

  // Verificar que son strings válidas
  if (typeof supabaseUrl !== 'string' || typeof supabaseAnonKey !== 'string') {
    console.error('❌ Invalid type for Supabase credentials')
    throw new Error('Invalid type for Supabase credentials')
  }

  // Verificar que la URL es válida
  try {
    new URL(supabaseUrl)
  } catch (e) {
    console.error('❌ Invalid Supabase URL:', supabaseUrl)
    throw new Error('Invalid Supabase URL format')
  }

  console.log('✅ Creating Supabase client...')
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
