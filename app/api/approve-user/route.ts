import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addToMailerlite } from '../../lib/mailerlite'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json()
    
    // 1. Actualizar status en Supabase
    const { error: updateError } = await supabase
      .from('waitlist')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (updateError) {
      throw new Error(`Supabase error: ${updateError.message}`)
    }
    
    // 2. Agregar a Mailerlite
    try {
      await addToMailerlite(email, name)
      console.log('✅ Usuario agregado a Mailerlite:', email)
    } catch (mailerliteError) {
      console.error('⚠️ Error en Mailerlite:', mailerliteError)
      // No fallar el proceso si Mailerlite falla
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Usuario aprobado correctamente'
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error approving user:', error)
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 })
  }
}
