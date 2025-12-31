# 🚀 Deploy Rápido en Vercel - 15 minutos

## Paso 1: Ir a Vercel (2 min)

1. Abre: **https://vercel.com/new**
2. Login con GitHub

## Paso 2: Importar Proyecto (1 min)

1. Busca: `mysticcbrand-hub/portalculture-app`
2. Click **"Import"**

## Paso 3: Configurar Variables de Entorno (5 min)

En la sección "Environment Variables", añade estas 6 variables.

**Copia los valores desde tu archivo `.env.local`:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_TYPEFORM_ID
SUPABASE_SERVICE_ROLE_KEY
MAILERLITE_API_KEY
MAILERLITE_GROUP_ID
```

**Para copiar rápido, abre tu terminal:**

```bash
cd Desktop/app
cat .env.local
```

Copia cada valor y pégalo en Vercel.

## Paso 4: Deploy (2 min)

1. Click **"Deploy"**
2. Espera 2-3 minutos
3. Anota tu URL: `https://portalculture-app-XXXXX.vercel.app`

## Paso 5: Configurar Webhook en Typeform (3 min)

1. Ve a: **https://admin.typeform.com**
2. Selecciona tu formulario (busca por ID: `01KDNY02YBPCQYJ5MTTVWPCZ2J`)
3. Click **"Connect"** → **"Webhooks"**
4. Click **"Add a webhook"**
5. URL: `https://TU-URL-VERCEL.vercel.app/api/typeform-webhook`
6. Click **"Save webhook"**
7. Click **"Test webhook"** para probar

## Paso 6: Verificar (2 min)

1. Ve a tu app en Vercel
2. Click en **"Functions"** o **"Logs"**
3. Deberías ver el request del webhook
4. Ve a `http://localhost:3000/admin/waitlist`
5. Deberías ver la solicitud de prueba

---

## ✅ ¡Listo!

Ahora ya tienes:
- ✅ App en producción
- ✅ Webhook funcionando
- ✅ Admin panel accesible

**URL de tu app**: `https://TU-URL.vercel.app`
**URL del webhook**: `https://TU-URL.vercel.app/api/typeform-webhook`
