# ✅ Checklist de Deployment - Portal Culture App

## 📦 Estado Actual del Proyecto

✅ **Proyecto creado desde cero** - Next.js 15+ con TypeScript
✅ **Auth completa** - Email/password + OAuth (Google/Discord)
✅ **Páginas implementadas** - Login, Dashboard, Cuestionario, Admin
✅ **Sistema de waitlist** - Con aprobación manual
✅ **Webhook de Typeform** - Funcionando y probado
✅ **Integración Mailerlite** - Lista para enviar emails
✅ **Código subido a GitHub** - Repo sincronizado
✅ **Servidor local funcionando** - http://localhost:3000

## 🚀 Próximos Pasos para Deploy en Vercel

### 1. Conectar con Vercel (5 minutos)

1. Ve a https://vercel.com/new
2. Importa el repo: `mysticcbrand-hub/portalculture-app`
3. Framework: Next.js (detectado automáticamente)
4. Root Directory: `./`
5. **NO hagas clic en Deploy todavía**

### 2. Configurar Variables de Entorno (CRÍTICO)

En la sección "Environment Variables" de Vercel, añade TODAS estas variables desde tu `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_TYPEFORM_ID
SUPABASE_SERVICE_ROLE_KEY
MAILERLITE_API_KEY
MAILERLITE_GROUP_ID
```

**⚠️ IMPORTANTE**: Copia los valores EXACTOS de tu archivo `.env.local` local.

### 3. Deploy (2 minutos)

1. Click en "Deploy"
2. Espera que termine el build (~2-3 min)
3. Anota tu URL: `https://portalculture-app.vercel.app` (o similar)

### 4. Configuraciones Post-Deploy

#### A. Supabase - Redirect URLs (5 minutos)

1. Ve a Supabase Dashboard
2. Authentication → URL Configuration
3. Añade estas URLs a "Redirect URLs":
   ```
   https://TU-URL-VERCEL.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
4. Site URL: `https://TU-URL-VERCEL.vercel.app`

#### B. Typeform - Webhook (2 minutos)

1. Ve a Typeform → Tu formulario (ID: 01KDNY02YBPCQYJ5MTTVWPCZ2J)
2. Settings → Webhooks
3. Add webhook:
   ```
   URL: https://TU-URL-VERCEL.vercel.app/api/typeform-webhook
   ```
4. Save

#### C. Mailerlite - Verificar (Opcional)

1. Ve a Mailerlite Dashboard
2. Verifica que el Group ID `175223345689659296` existe
3. Prepara el email de bienvenida (se envía automáticamente cuando apruebes usuarios)

## 🧪 Testing Post-Deploy

### Test 1: Login básico
1. Ve a `https://TU-URL-VERCEL.vercel.app`
2. Registra un usuario de prueba
3. Deberías llegar al cuestionario

### Test 2: OAuth (Opcional)
1. Intenta login con Google
2. Intenta login con Discord

### Test 3: Cuestionario
1. Completa el Typeform
2. Verifica que el webhook funciona (logs en Vercel)

### Test 4: Admin Panel
1. Login con `mysticcbrand@gmail.com`
2. Ve a `/admin/waitlist`
3. Deberías ver las solicitudes pendientes

### Test 5: Aprobación completa
1. En admin, aprueba un usuario
2. Verifica que se añade a Mailerlite
3. Usuario debería recibir email

## 📝 Estructura Final del Proyecto

```
portalculture-app/
├── app/
│   ├── page.tsx                      ✅ Login/Registro (Glassmorphism)
│   ├── dashboard/page.tsx            ✅ Dashboard premium
│   ├── cuestionario/page.tsx         ✅ Typeform embebido
│   ├── admin/waitlist/page.tsx       ✅ Panel admin
│   ├── api/
│   │   ├── typeform-webhook/         ✅ Recibe respuestas
│   │   └── mailerlite/               ✅ Añade a lista
│   └── auth/callback/                ✅ OAuth callback
├── lib/
│   ├── supabase.ts                   ✅ Cliente browser
│   └── supabase-server.ts            ✅ Cliente server
├── utils/supabase/
│   ├── client.ts                     ✅ SSR browser
│   └── server.ts                     ✅ SSR server
├── middleware.ts                     ✅ Protección rutas
├── .env.local                        ✅ Variables (NO en git)
└── README.md                         ✅ Documentación

TOTAL: 8 páginas/rutas principales
```

## 🎨 Características del Diseño

- ✅ Dark theme (#000000)
- ✅ Glassmorphism effects (bg-white/5, backdrop-blur-xl)
- ✅ Bordes sutiles (border-white/10)
- ✅ Animaciones suaves
- ✅ Responsive design
- ✅ Premium Apple-like aesthetic

## 🔐 Seguridad Implementada

- ✅ Middleware protege rutas privadas
- ✅ Admin solo para mysticcbrand@gmail.com
- ✅ Service Role Key solo en server-side
- ✅ Variables sensibles en .env (no en git)
- ✅ OAuth configurado con redirect seguros

## 📊 Flujos Implementados

### Flujo Usuario Nuevo:
1. Registro → Cuestionario → Waitlist (pending)
2. Admin aprueba → Mailerlite → Email automático
3. Usuario puede acceder al dashboard

### Flujo Usuario Existente:
1. Login → Dashboard
2. Acceso a Discord (Whop)
3. Acceso a cursos (próximamente)

### Flujo Admin:
1. Login → Admin panel
2. Ver solicitudes pendientes
3. Aprobar/Rechazar con un click
4. Integración automática con Mailerlite

## 🐛 Troubleshooting

### Build falla en Vercel:
- Revisa los logs en Vercel
- Verifica que todas las variables estén configuradas
- Asegúrate de que el Node version es compatible

### OAuth no funciona:
- Verifica Redirect URLs en Supabase
- Comprueba que las credenciales OAuth estén en Supabase Dashboard
- Revisa los logs del browser console

### Webhook no recibe datos:
- Verifica la URL en Typeform
- Comprueba logs en Vercel → Functions
- Prueba el endpoint: `https://TU-URL/api/typeform-webhook` (debería responder con JSON)

### Mailerlite no envía:
- Verifica el API Key en Vercel
- Comprueba que el Group ID existe
- Revisa logs de la función en Vercel

## 📞 Contacto

**Admin**: mysticcbrand@gmail.com
**Repo**: https://github.com/mysticcbrand-hub/portalculture-app
**Landing**: https://portalculture.vercel.app (NO tocar)

---

## 🎉 ¡LISTO PARA DEPLOY!

Todo el código está funcionando localmente y subido a GitHub.
Solo falta:
1. Conectar con Vercel
2. Configurar variables de entorno
3. Deploy
4. Configurar webhooks/redirects

**Tiempo estimado total: 15-20 minutos**
