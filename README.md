# Portal Culture App 🚀

Aplicación web premium para la comunidad exclusiva Portal Culture de desarrollo personal y crecimiento.

## 🌟 Características

- ✅ **Autenticación completa** con Supabase (email/password + OAuth Google/Discord)
- ✅ **Sistema de lista de espera** con aprobación manual
- ✅ **Dashboard premium** con diseño glassmorphism
- ✅ **Cuestionario embebido** de Typeform
- ✅ **Panel de administración** para gestionar solicitudes
- ✅ **Integración con Mailerlite** para emails automáticos
- ✅ **Webhook de Typeform** para procesar respuestas

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Auth & Database**: Supabase
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Email Marketing**: Mailerlite
- **Forms**: Typeform

## 📁 Estructura del Proyecto

```
app/
├── page.tsx                          # Login/Registro
├── dashboard/page.tsx                # Dashboard principal
├── cuestionario/page.tsx             # Cuestionario Typeform
├── admin/waitlist/page.tsx           # Panel admin
├── api/
│   ├── typeform-webhook/route.ts     # Webhook de Typeform
│   └── mailerlite/add-subscriber/    # API Mailerlite
└── auth/callback/route.ts            # Callback OAuth

lib/
├── supabase.ts                       # Cliente Supabase
└── supabase-server.ts                # Cliente Supabase server

utils/supabase/
├── client.ts                         # Supabase browser client
└── server.ts                         # Supabase server client

middleware.ts                          # Protección de rutas
```

## 🚀 Deployment en Vercel

### 1. Variables de Entorno Requeridas

En el dashboard de Vercel, añade estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TYPEFORM_ID=your_typeform_id

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=your_mailerlite_group_id
```

**Nota**: Los valores reales están en el archivo `.env.local` (no incluido en git por seguridad).

### 2. Configuración de Supabase

#### Tabla `waitlist` (si no existe):

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  typeform_response_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Índices
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
```

#### OAuth Providers en Supabase:

1. **Google OAuth**:
   - Redirect URL: `https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback`
   - Client ID: Ver `.env.local`
   - Client Secret: Ver `.env.local`

2. **Discord OAuth**:
   - Redirect URL: `https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback`
   - Client ID: Ver `.env.local`
   - Client Secret: Ver `.env.local`

### 3. Configurar Webhook de Typeform

1. Ve a tu formulario en Typeform
2. Settings → Webhooks → Add webhook
3. URL: `https://app-portalculture.vercel.app/api/typeform-webhook`
4. Secret: (opcional)

## 🔄 Flujo de Usuario

### Usuario Nuevo:
1. Accede a `/` y se registra con email/password o OAuth
2. Automáticamente redirigido a `/cuestionario`
3. Completa el formulario de Typeform
4. Webhook guarda respuesta en `waitlist` (status: pending)
5. Admin revisa y aprueba en `/admin/waitlist`
6. Usuario es añadido a Mailerlite automáticamente
7. Recibe email de bienvenida

### Usuario Existente:
1. Login en `/`
2. Redirigido a `/dashboard`
3. Accede a Discord, cursos y demás recursos

### Admin:
1. Login con `mysticcbrand@gmail.com`
2. Acceso a `/admin/waitlist`
3. Revisa solicitudes pendientes
4. Aprueba/Rechaza usuarios

## 🎨 Diseño

- **Theme**: Dark (#000000 background)
- **Estilo**: Glassmorphism premium
- **Inspiración**: Apple, diseño inmersivo
- **Colores**: Gradientes purple/blue con glass effects

## 📝 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Start producción
npm start

# Lint
npm run lint
```

## 🔒 Seguridad

- ✅ Rutas protegidas con middleware
- ✅ Admin solo para `mysticcbrand@gmail.com`
- ✅ Service Role Key solo en servidor
- ✅ OAuth configurado correctamente

## 📧 Soporte

Para dudas o problemas: mysticcbrand@gmail.com

---

**Portal Culture** - Comunidad exclusiva de desarrollo personal © 2025
