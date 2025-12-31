import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Typeform webhook received:', JSON.stringify(body, null, 2))

    // Extract data from Typeform webhook
    const { form_response } = body
    
    if (!form_response) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    const { response_id, answers, hidden } = form_response
    
    // Get email from hidden fields (we pass it when embedding the form)
    const email = hidden?.email
    
    if (!email) {
      console.error('No email found in webhook data')
      return NextResponse.json({ error: 'No email provided' }, { status: 400 })
    }

    // Extract name from answers (assuming first question is name)
    let name = 'Usuario'
    if (answers && answers.length > 0) {
      const nameAnswer = answers.find((a: any) => 
        a.type === 'text' || a.type === 'short_text'
      )
      if (nameAnswer?.text) {
        name = nameAnswer.text
      }
    }

    // Save to waitlist table
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert([
        {
          email,
          name,
          typeform_response_id: response_id,
          status: 'pending',
          metadata: {
            answers: answers || [],
            hidden: hidden || {}
          }
        }
      ])
      .select()

    if (error) {
      console.error('Error saving to waitlist:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully saved to waitlist:', data)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Typeform webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
