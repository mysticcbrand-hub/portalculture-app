import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Buscar en waitlist usando el cliente admin (bypassa RLS)
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('status, rejected_at')
      .eq('email', email)
      .single()

    if (error || !data) {
      return NextResponse.json({ 
        approved: false, 
        message: 'No tienes una invitación aprobada. Por favor, completa el cuestionario primero en la página principal.' 
      })
    }

    if (data.status !== 'approved') {
      return NextResponse.json({ 
        approved: false,
        status: data.status,
        rejected_at: data.rejected_at,
        message: data.status === 'rejected'
          ? 'Tu solicitud no ha sido aprobada'
          : 'Tu solicitud aún está siendo revisada. Te contactaremos pronto por email.'
      })
    }

    return NextResponse.json({ 
      approved: true,
      status: data.status,
      message: 'Email aprobado' 
    })
  } catch (error: any) {
    console.error('Error checking waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
