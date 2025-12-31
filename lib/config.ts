// Configuración hardcodeada para debugging
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dzbmnumpzdhydfkjmlif.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Ym1udW1wemRoeWRma2ptbGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzE3MjcsImV4cCI6MjA4MjYwNzcyN30.sGwUhcYOYDHczgIRL7an82oJkiQ1yXXU0rrCdQFwCm0'
  },
  typeform: {
    id: process.env.NEXT_PUBLIC_TYPEFORM_ID || '01KDNY02YBPCQYJ5MTTVWPCZ2J'
  }
}
