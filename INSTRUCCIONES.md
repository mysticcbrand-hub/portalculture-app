# 🚀 Instrucciones de Implementación - Portal Culture App

## 📁 Estructura de Archivos a Crear/Actualizar

### 1. **Actualizar `app/components/AuthForm.tsx`**
- Reemplaza el contenido con: `tmp_rovodev_AuthForm.tsx`
- ✨ Nuevas features:
  - OAuth con Google y Discord
  - Botón "Registrar" redirige a `/register`
  - Login tradicional con email/password
  - Diseño mejorado con gradientes

### 2. **Actualizar `app/page.tsx`**
- Reemplaza el contenido con: `tmp_rovodev_main_page.tsx`
- ✨ Cambios:
  - Redirección automática al dashboard si estás logueado
  - Muestra AuthForm si no hay sesión

### 3. **Crear `app/register/page.tsx`** (NUEVA)
- Copia el contenido de: `tmp_rovodev_register_page.tsx`
- ✨ Features:
  - Typeform embebido con tus datos pre-filled
  - Solo accesible si estás logueado
  - Redirección automática al dashboard después de completar

### 4. **Crear `app/auth/callback/route.ts`** (NUEVA)
- Crea la carpeta: `app/auth/callback/`
- Crea el archivo: `route.ts`
- Copia el contenido de: `tmp_rovodev_auth_callback_route.tsx`
- ✨ Purpose: Maneja el callback de OAuth (Google/Discord)

### 5. **Crear `app/dashboard/page.tsx`** (NUEVA)
- Copia el contenido de: `tmp_rovodev_dashboard_page.tsx`
- ✨ Features:
  - Dashboard premium con diseño inmersivo
  - Card para Discord (con link de Whop)
  - Sección de cursos (placeholder para tus cursos de Whop)
  - Stats de la comunidad
  - Solo accesible si estás logueado

## 🔧 Configuración de Supabase

### Habilitar OAuth Providers

1. Ve a tu proyecto Supabase: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif

2. **Configurar Google OAuth:**
   - Ve a `Authentication` → `Providers` → `Google`
   - Actívalo
   - Obtén las credenciales de Google Cloud Console:
     - Ve a: https://console.cloud.google.com/apis/credentials
     - Crea un nuevo proyecto o usa uno existente
     - Crea OAuth 2.0 Client ID
     - Authorized redirect URIs: `https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback`
   - Copia Client ID y Client Secret a Supabase

3. **Configurar Discord OAuth:**
   - Ve a `Authentication` → `Providers` → `Discord`
   - Actívalo
   - Obtén las credenciales de Discord Developer Portal:
     - Ve a: https://discord.com/developers/applications
     - Crea una nueva aplicación
     - Ve a OAuth2 → Add Redirect: `https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback`
   - Copia Client ID y Client Secret a Supabase

## 📝 URLs de Redirección

Las URLs de callback que necesitas configurar en OAuth providers:
```
https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback
```

Para desarrollo local (opcional):
```
http://localhost:3000/auth/callback
```

## 🎨 Flujo de Usuario

### Registro (Nueva Cuenta):
1. Usuario llega a la app → Ve AuthForm
2. Click en "Regístrate" o botones de Google/Discord
3. Se autentica con OAuth → Redirige a `/register`
4. Completa Typeform con datos pre-filled
5. Después de enviar → Redirige a `/dashboard`

### Login (Usuario Existente):
1. Usuario llega a la app → Ve AuthForm
2. Inicia sesión con email/password o OAuth
3. Redirige directamente a `/dashboard`
4. Dashboard muestra: Discord access + Cursos de Whop

## 🔐 Variables de Entorno

Tu `.env.local` ya tiene todo configurado:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dzbmnumpzdhydfkjmlif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_TYPEFORM_ID=n0EFRLFF
```

## 🚀 Deploy a Vercel

1. **Git push:**
```bash
cd /Users/mario/Desktop/app
git add .
git commit -m "feat: OAuth login, registration flow, and premium dashboard"
git push origin main
```

2. **Configurar en Vercel:**
   - Ve a: https://vercel.com/mysticcbrand-hub/portalculture-app
   - Settings → Environment Variables
   - Agrega las mismas variables de `.env.local`
   - Redeploy

3. **Configurar URLs en Supabase:**
   - En Supabase → Authentication → URL Configuration
   - Site URL: `https://app-portalculture.vercel.app`
   - Redirect URLs: Agrega `https://app-portalculture.vercel.app/auth/callback`

## ✨ Próximos Pasos (Opcional)

1. **Agregar cursos reales:**
   - Edita `app/dashboard/page.tsx`
   - Reemplaza los placeholders con tus URLs de Whop
   - Actualiza nombres y descripciones

2. **Personalizar stats:**
   - Edita la sección de stats en el dashboard
   - Actualiza números reales de tu comunidad

3. **Agregar más features:**
   - Sistema de notificaciones
   - Perfil de usuario editable
   - Tracking de progreso en cursos

## 🐛 Troubleshooting

**Error: "Auth session missing"**
- Verifica que las URLs de callback estén bien configuradas en Supabase

**OAuth no funciona:**
- Revisa que Client ID y Secret estén correctos
- Verifica las redirect URIs en Google/Discord

**Typeform no se muestra:**
- Verifica que el script de Typeform se cargue correctamente
- Chequea la consola del navegador para errores

## 📞 Testing Local

```bash
cd /Users/mario/Desktop/app
npm run dev
```

Visita: http://localhost:3000

---

¡Todo listo! Cualquier duda, revisa este documento o pregúntame 🚀
