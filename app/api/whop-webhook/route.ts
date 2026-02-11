import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Service role client para bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Webhook de Whop para gestionar compras
 * Configura en Whop: https://dash.whop.com/settings/developer
 * URL: https://app.portalculture.com/api/whop-webhook
 * Events: payment.succeeded, membership.went_valid
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-whop-signature')
    
    // Verificar firma de Whop (seguridad)
    if (process.env.WHOP_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WHOP_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('❌ Invalid Whop signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('📥 Whop webhook event:', event.action, event.data?.id)

    // Eventos que nos interesan
    if (event.action === 'payment.succeeded' || event.action === 'membership.went_valid') {
      const { data } = event
      
      // Extraer información del usuario
      const userEmail = data.user?.email || data.email
      const userName = data.user?.username || data.user?.name || 'Usuario Premium'
      const whopUserId = data.user?.id || data.user_id
      const membershipId = data.id
      const productId = data.product?.id || data.product_id
      
      if (!userEmail) {
        console.error('❌ No email in Whop event')
        return NextResponse.json({ error: 'No email provided' }, { status: 400 })
      }

      console.log('👤 Processing payment for:', userEmail)

      // 1. Verificar si el usuario ya existe en auth.users
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      let userId = existingUsers?.users?.find(u => u.email === userEmail)?.id

      // 2. Si no existe, crear cuenta automáticamente
      if (!userId) {
        console.log('🆕 Creating new user account for:', userEmail)
        
        // Generar password temporal seguro
        const tempPassword = crypto.randomBytes(32).toString('hex')
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: userEmail,
          password: tempPassword,
          email_confirm: true, // Auto-confirmar email
          user_metadata: {
            full_name: userName,
            source: 'whop_payment',
            whop_user_id: whopUserId,
            created_via_payment: true
          }
        })

        if (createError) {
          console.error('❌ Error creating user:', createError)
          throw createError
        }

        userId = newUser.user.id
        console.log('✅ User created:', userId)

        // Crear perfil en profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: userName,
            avatar_url: null,
          })

        if (profileError && profileError.code !== '23505') { // Ignorar duplicados
          console.error('⚠️ Error creating profile:', profileError)
        }
      }

      // 3. Marcar usuario como premium en tabla premium_users
      const { error: premiumError } = await supabase
        .from('premium_users')
        .upsert({
          user_id: userId,
          email: userEmail,
          whop_user_id: whopUserId,
          whop_membership_id: membershipId,
          whop_product_id: productId,
          payment_status: 'active',
          purchased_at: new Date().toISOString(),
          access_granted: true,
        }, {
          onConflict: 'user_id'
        })

      if (premiumError) {
        console.error('❌ Error updating premium_users:', premiumError)
        throw premiumError
      }

      console.log('✅ Premium access granted to:', userEmail)

      // 4. Generar token de acceso único (magic link)
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.portalculture.com'}/dashboard`
        }
      })

      if (tokenError) {
        console.error('❌ Error generating magic link:', tokenError)
      } else {
        console.log('🔗 Magic link generated for:', userEmail)
        // TODO: Enviar email con el magic link o mostrar en página de confirmación
      }

      return NextResponse.json({ 
        success: true,
        message: 'Premium access granted',
        userId,
        email: userEmail
      })
    }

    // Eventos de cancelación/expiración
    if (event.action === 'membership.went_invalid' || event.action === 'payment.failed') {
      const { data } = event
      const userEmail = data.user?.email || data.email

      if (userEmail) {
        // Buscar usuario
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const userId = existingUsers?.users?.find(u => u.email === userEmail)?.id

        if (userId) {
          // Marcar como inactivo
          await supabase
            .from('premium_users')
            .update({
              payment_status: 'inactive',
              access_granted: false
            })
            .eq('user_id', userId)

          console.log('⚠️ Premium access revoked for:', userEmail)
        }
      }

      return NextResponse.json({ success: true, message: 'Access revoked' })
    }

    // Otros eventos - solo log
    return NextResponse.json({ success: true, message: 'Event received' })

  } catch (error: any) {
    console.error('❌ Error in Whop webhook:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
