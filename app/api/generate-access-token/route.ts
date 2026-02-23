import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

// Service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Endpoint para generar token de acceso después de compra en Whop
 * URL redirect de Whop: https://app.portalculture.com/api/generate-access-token?email={{customer_email}}
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const whopUserId = searchParams.get('whop_user_id')

    if (!email) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Error - Portal Culture</title>
            <style>
              body {
                background: #000;
                color: #fff;
                font-family: system-ui;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
              }
              .container {
                text-align: center;
                max-width: 500px;
                padding: 2rem;
              }
              h1 { color: #ef4444; }
              a {
                display: inline-block;
                margin-top: 2rem;
                padding: 1rem 2rem;
                background: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 0.5rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Error</h1>
              <p>No se proporcionó un email válido.</p>
              <a href="https://portalculture.com">Volver al inicio</a>
            </div>
          </body>
        </html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    console.log('🔐 Generating access token for:', email)

    // 1. Buscar usuario por email directamente en auth.users (DB) con service role
    const { data: authUser } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    let user = authUser ? { id: authUser.id, email: authUser.email } as any : null

    // Limpia perfiles duplicados por email antes de crear usuario (evita constraint)
    if (!user) {
      await supabase
        .from('profiles')
        .delete()
        .eq('email', email.toLowerCase())
    }

    // 2. Si no existe en absoluto, crearlo
    if (!user) {
      console.log('🆕 Creating user account for:', email)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          source: 'whop_payment',
          created_via_payment: true
        }
      })
      if (createError) {
        if (createError.message?.includes('already') || createError.code === '23505') {
          const { data: retryUser } = await supabase
            .from('auth.users')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .maybeSingle()
          if (retryUser) {
            user = { id: retryUser.id, email: retryUser.email } as any
          }
        }
        if (!user) {
          console.error('❌ Error creating user:', createError)
          throw new Error(`No se pudo crear la cuenta: ${createError.message}`)
        }
      } else {
        user = newUser.user
      }
    }

    // 3. Marcar user_metadata como paid (fallback si RLS bloquea lectura)
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        access_status: 'paid',
        source: 'whop_payment',
      },
    })

    // 4. Añadir a MailerLite grupo de pago (approved)
    try {
      const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
      const PAID_GROUP_ID = process.env.MAILERLITE_PAID_GROUP_ID || '180221278017292151'
      if (MAILERLITE_API_KEY) {
        await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email,
            fields: { name: '' },
            groups: [PAID_GROUP_ID],
          }),
        })
      }
    } catch (error) {
      console.error('⚠️ MailerLite paid group error:', error)
    }

    // 5. Garantizar que el usuario tiene acceso premium en premium_users
    // (puede llegar aquí antes del webhook de Whop — race condition fix)
    const { error: premiumError } = await supabase
      .from('premium_users')
      .upsert({
        user_id: user.id,
        email: email.toLowerCase(),
        payment_status: 'active',
        access_granted: true,
        purchased_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (premiumError) {
      console.error('⚠️ Error upserting premium_users:', premiumError)
      // No bloqueamos — seguimos generando el magic link
    }

    // 4. Garantizar perfil en profiles (limpia duplicados por email)
    await supabase
      .from('profiles')
      .delete()
      .eq('email', email.toLowerCase())

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: email.toLowerCase(),
        access_status: 'paid',
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    // 3. Generar magic link de acceso (REST admin) para obtener email_otp siempre
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://app.portalculture.com').trim().replace(/\/$/, '')
    const generateRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'magiclink',
        email,
        options: { redirectTo: `${appUrl}/confirm-email?next=/dashboard` },
      }),
    })

    if (!generateRes.ok) {
      const errText = await generateRes.text()
      console.error('❌ Error generating magic link:', errText)
      throw new Error('No se pudo generar el enlace de acceso')
    }

    const tokenData = await generateRes.json()
    if (!tokenData?.action_link) {
      throw new Error('No se pudo generar el enlace de acceso')
    }

    // action_link incluye token + redirect_to
    let accessLink = tokenData.action_link

    // Intento: verificar OTP en servidor con endpoint /verify
    const emailOtp = tokenData.email_otp
    const verificationType = tokenData.verification_type || 'magiclink'
    const actionToken = (() => {
      try {
        return new URL(accessLink).searchParams.get('token')
      } catch {
        return null
      }
    })()

    let sessionData = null as null | { access_token: string; refresh_token: string }

    const verifyWithToken = async (token: string) => {
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: verificationType,
          email,
          token,
        }),
      })

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json()
        if (verifyData?.access_token && verifyData?.refresh_token) {
          sessionData = {
            access_token: verifyData.access_token,
            refresh_token: verifyData.refresh_token,
          }
          return true
        }
      }

      return false
    }

    // Primero probamos token del action_link, luego email_otp
    if (actionToken) {
      await verifyWithToken(actionToken)
    }

    if (!sessionData && emailOtp) {
      await verifyWithToken(emailOtp)
    }

    if (!sessionData) {
      throw new Error('No se pudo validar el token de acceso (magiclink).')
    }

    const confirmUrl = `${appUrl}/confirm-email?next=/dashboard#access_token=${sessionData.access_token}&refresh_token=${sessionData.refresh_token}&type=magiclink`
    accessLink = confirmUrl

    console.log('✅ Access link generated for:', email)

    // 4. Página de éxito con auto-redirect - Estilo premium
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Portal Culture</title>
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            
            body {
              background: #000;
              color: #fff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              overflow: hidden;
            }
            
            /* Background gradient cinematográfico */
            .bg-gradient {
              position: fixed;
              inset: 0;
              z-index: -1;
              background: 
                radial-gradient(circle 900px at 20% 30%, rgba(37, 99, 235, 0.18), transparent 65%),
                radial-gradient(circle 800px at 80% 70%, rgba(124, 58, 237, 0.15), transparent 60%),
                radial-gradient(ellipse 78% 68% at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 72%, rgba(0,0,0,0.85) 100%);
            }
            
            .container {
              text-align: center;
              max-width: 600px;
              padding: 3rem 2rem;
              position: relative;
            }
            
            .icon {
              font-size: 4rem;
              margin-bottom: 1.5rem;
              animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            h1 {
              font-size: 2.5rem;
              margin-bottom: 1rem;
              font-weight: 700;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
            }
            
            p {
              color: #999;
              font-size: 1.125rem;
              line-height: 1.6;
              margin-bottom: 1rem;
              animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
            }
            
            .countdown {
              color: #3b82f6;
              font-weight: 700;
            }
            
            .spinner {
              width: 60px;
              height: 60px;
              border: 3px solid rgba(59, 130, 246, 0.1);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
            }
            
            .manual-link {
              display: inline-block;
              margin-top: 2rem;
              padding: 1rem 2rem;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              text-decoration: none;
              border-radius: 0.75rem;
              font-weight: 600;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              border: 1px solid rgba(255,255,255,0.1);
              animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
            }
            
            .manual-link:hover {
              transform: translateY(-3px);
              box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
            }
            
            .features {
              margin-top: 3rem;
              display: grid;
              gap: 0.75rem;
              animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
            }
            
            .feature {
              color: #666;
              font-size: 0.875rem;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
            }
            
            .check {
              color: #10b981;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @media (max-width: 640px) {
              h1 { font-size: 2rem; }
              .icon { font-size: 3rem; }
            }
          </style>
        </head>
        <body>
          <div class="bg-gradient"></div>
          
          <div class="container">
            <div class="icon">✨</div>
            <h1>Bienvenido a Portal Culture</h1>
            <p>Tu acceso premium ha sido activado correctamente.</p>
            <p>Redirigiendo en <span class="countdown" id="countdown">3</span> segundos...</p>
            
            <div class="spinner"></div>
            
            <div class="features">
              <div class="feature">
                <span class="check">✓</span>
                <span>5 Templos desbloqueados</span>
              </div>
              <div class="feature">
                <span class="check">✓</span>
                <span>Acceso a NOVA AI</span>
              </div>
              <div class="feature">
                <span class="check">✓</span>
                <span>Rol Deluxe Discord</span>
              </div>
            </div>
            
            <a href="${accessLink}" class="manual-link">
              Acceder al Dashboard
            </a>
          </div>
          
          <script>
            let count = 3;
            const countdownEl = document.getElementById('countdown');
            const interval = setInterval(() => {
              count--;
              if (countdownEl) countdownEl.textContent = count;
              if (count <= 0) {
                clearInterval(interval);
                window.location.href = '${accessLink}';
              }
            }, 1000);
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    )

  } catch (error: any) {
    console.error('❌ Error in generate-access-token:', error)
    
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Error - Portal Culture</title>
          <style>
            body {
              background: #000;
              color: #fff;
              font-family: system-ui;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              max-width: 500px;
              padding: 2rem;
            }
            h1 { color: #ef4444; }
            a {
              display: inline-block;
              margin-top: 2rem;
              padding: 1rem 2rem;
              background: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>${error.message || 'Ha ocurrido un error inesperado'}</p>
            <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">
              Contacta con soporte: mysticcbrand@gmail.com
            </p>
            <a href="https://portalculture.com">Volver al inicio</a>
          </div>
        </body>
      </html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}
