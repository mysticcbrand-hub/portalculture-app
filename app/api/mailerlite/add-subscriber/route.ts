import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID

    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
      console.error('Mailerlite credentials not configured')
      return NextResponse.json({ error: 'Mailerlite not configured' }, { status: 500 })
    }

    // Add subscriber to Mailerlite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        fields: {
          name: name || ''
        },
        groups: [MAILERLITE_GROUP_ID]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Mailerlite API error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to add subscriber' },
        { status: response.status }
      )
    }

    console.log('Successfully added to Mailerlite:', email)

    return NextResponse.json({ 
      success: true, 
      subscriber: data.data 
    })
  } catch (error: any) {
    console.error('Error adding subscriber:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
