import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TypeformAnswer {
  type: string
  email?: string
  text?: string
  short_text?: string
  [key: string]: unknown
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Extraer datos de Typeform
    const formResponse = body.form_response
    const answers = formResponse.answers as TypeformAnswer[]
    
    // Mapear respuestas
    const emailAnswer = answers.find((a) => a.type === 'email')
    const nameAnswer = answers.find((a) => a.type === 'text' || a.type === 'short_text')
    
    const email = emailAnswer?.email
    const name = nameAnswer?.text || nameAnswer?.short_text || 'Sin nombre'
    
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 })
    }
    
    // Guardar en Supabase
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email,
        name,
        typeform_response_id: formResponse.response_id,
        status: 'pending',
        metadata: formResponse
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving to waitlist:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    console.log('✅ Usuario agregado a waitlist:', email)
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Para verificar que el endpoint funciona
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Typeform webhook endpoint ready'
  })
}
