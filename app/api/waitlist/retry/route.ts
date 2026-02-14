import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const COOLDOWN_DAYS = 14

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('status, rejected_at')
      .eq('email', email)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    if (data.status !== 'rejected') {
      return NextResponse.json({ error: 'Solo disponible para solicitudes rechazadas.' }, { status: 400 })
    }

    if (data.rejected_at) {
      const rejectedAt = new Date(data.rejected_at)
      const retryAt = new Date(rejectedAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
      if (retryAt > new Date()) {
        return NextResponse.json({
          error: 'Aún no puedes reintentar.',
          retry_at: retryAt.toISOString()
        }, { status: 429 })
      }
    }

    const { error: resetError } = await supabaseAdmin
      .from('waitlist')
      .update({
        status: 'pending',
        rejected_at: null
      })
      .eq('email', email)

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Retry waitlist error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
