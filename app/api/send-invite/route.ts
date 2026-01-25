import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY

    if (!MAILERLITE_API_KEY) {
      console.error('Mailerlite credentials not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Create personalized invite link
    const inviteLink = `https://app-portalculture.vercel.app?email=${encodeURIComponent(email)}&approved=true`

    // Send transactional email via Mailerlite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: name || 'Usuario',
          invite_link: inviteLink
        },
        groups: [process.env.MAILERLITE_GROUP_ID],
        status: 'active'
      })
    })

    // For now, we'll rely on Mailerlite automation to send the welcome email
    // when user is added to the group with status 'approved'

    // Alternative: Use Mailerlite Automations or Campaigns
    // The subscriber being added should trigger an automation

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Mailerlite error:', errorData)
      // Don't fail the whole process if email fails
      console.log('Note: Subscriber may already exist in Mailerlite')
    }

    console.log('✅ Invite process completed for:', email)

    return NextResponse.json({ 
      success: true, 
      message: `Invitación enviada a ${email}`,
      inviteLink 
    })
  } catch (error: any) {
    console.error('Error sending invite:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
