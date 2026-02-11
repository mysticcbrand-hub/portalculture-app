import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // 1. Verificar si el usuario existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let user = existingUsers?.users?.find(u => u.email === email)

    // 2. Si no existe, verificar si tiene acceso premium pendiente
    if (!user) {
      // Verificar en premium_users si hay un registro
      const { data: premiumRecord } = await supabase
        .from('premium_users')
        .select('*')
        .eq('email', email)
        .single()

      if (!premiumRecord) {
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>No autorizado - Portal Culture</title>
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
                p { color: #999; }
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
                <h1>🚫 Acceso no autorizado</h1>
                <p>No se encontró una compra asociada a este email.</p>
                <p>Si acabas de realizar la compra, espera unos minutos e intenta de nuevo.</p>
                <a href="https://portalculture.com">Volver al inicio</a>
              </div>
            </body>
          </html>`,
          {
            status: 403,
            headers: { 'Content-Type': 'text/html' }
          }
        )
      }
    }

    // 3. Generar magic link de acceso
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.portalculture.com'}/dashboard`
      }
    })

    if (tokenError || !tokenData?.properties?.action_link) {
      console.error('❌ Error generating magic link:', tokenError)
      throw new Error('No se pudo generar el enlace de acceso')
    }

    const accessLink = tokenData.properties.action_link
    console.log('✅ Access link generated for:', email)

    // 4. Página de éxito con auto-redirect
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Acceso Concedido - Portal Culture</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #000;
              color: #fff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              max-width: 600px;
              padding: 3rem 2rem;
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 1rem;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              color: #999;
              font-size: 1.125rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .spinner {
              width: 50px;
              height: 50px;
              border: 3px solid rgba(255,255,255,0.1);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
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
              transition: transform 0.2s;
            }
            .manual-link:hover {
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ ¡Bienvenido a Portal Culture!</h1>
            <p>Tu acceso premium ha sido activado.</p>
            <p>Redirigiendo al dashboard en <span id="countdown">3</span> segundos...</p>
            <div class="spinner"></div>
            <p style="font-size: 0.875rem; color: #666;">
              Si no eres redirigido automáticamente:
            </p>
            <a href="${accessLink}" class="manual-link">
              Acceder al Dashboard →
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
        headers: { 'Content-Type': 'text/html' }
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
