# 🎨 Personalizar Branding de Supabase - Portal Culture

## 1️⃣ Personalizar Emails de Supabase

### Ir a Email Templates:
1. Ve a: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/auth/templates
2. Verás templates para:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### Personalizar cada template:

Reemplaza el contenido con este HTML (ajusta para cada tipo):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal Culture</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); padding: 60px 40px;">
          
          <!-- Logo/Header -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 700; background: linear-gradient(to right, #ffffff, #e0e0e0, #ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Portal Culture
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.6); font-size: 14px;">
                Tu comunidad de transformación personal
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; padding-bottom: 30px;">
              <p style="margin: 0 0 20px 0;">¡Hola!</p>
              <p style="margin: 0 0 20px 0;">{{ .ConfirmationURL }}</p>
              <p style="margin: 0;">Si no solicitaste esto, puedes ignorar este email.</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                Confirmar Email
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px;">
              <p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 12px;">
                © 2024 Portal Culture. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Variables disponibles según el template:**
- Confirm signup: `{{ .ConfirmationURL }}`
- Magic Link: `{{ .ConfirmationURL }}`
- Reset Password: `{{ .ConfirmationURL }}`
- Change Email: `{{ .ConfirmationURL }}`

---

## 2️⃣ Personalizar Pantalla de Consentimiento OAuth

### Google OAuth:
La pantalla que dice "Elige un correo para iniciar sesión..." es de Google.

**Para personalizarla:**

1. Ve a Google Cloud Console: https://console.cloud.google.com
2. Selecciona tu proyecto
3. Ve a **"OAuth consent screen"**
4. Configura:
   - **Application name**: `Portal Culture`
   - **Application logo**: Sube tu logo (512x512px, PNG/JPG)
   - **Application home page**: `https://app-portalculture.vercel.app`
   - **Application privacy policy**: `https://portalculture.vercel.app/privacy` (crea esta página)
   - **Authorized domains**: `vercel.app`, `portalculture.vercel.app`
   - **Support email**: Tu email de soporte

### Discord OAuth:
1. Ve a: https://discord.com/developers/applications
2. Selecciona tu aplicación
3. En **General Information**:
   - **Name**: `Portal Culture`
   - **Icon**: Sube tu logo
   - **Description**: "Comunidad exclusiva de desarrollo personal"
   
---

## 3️⃣ Configurar Metadata del Proyecto

En Supabase:
1. Ve a: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/settings/general
2. **Project name**: `Portal Culture`
3. En **API Settings** → **JWT Settings**:
   - Puedes agregar custom claims si necesitas

---

## ✅ Checklist:

- [ ] Personalizar templates de email en Supabase
- [ ] Configurar OAuth consent screen en Google Cloud
- [ ] Configurar branding en Discord Developer Portal
- [ ] Subir logo de Portal Culture (512x512px)
- [ ] Crear página de Privacy Policy
- [ ] Probar emails con el nuevo diseño

---

¡Listo! Con esto tendrás un branding profesional y consistente en todo el flujo de autenticación.
