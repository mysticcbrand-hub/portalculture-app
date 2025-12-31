# 🚀 Guía de Deployment en Vercel

## Paso 1: Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Conecta tu cuenta de GitHub
4. Selecciona el repo: `mysticcbrand-hub/portalculture-app`
4. Click en "Import"

## Paso 2: Configurar Variables de Entorno

En la sección "Environment Variables" añade:

### Variables Públicas (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_TYPEFORM_ID=your_typeform_id
```

### Variables Privadas (Solo servidor)
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=your_group_id
```

**⚠️ IMPORTANTE**: Copia los valores reales desde tu archivo `.env.local` local. No compartas estos valores públicamente.

## Paso 3: Configurar Dominio

1. En "Settings" → "Domains"
2. El dominio automático será: `portalculture-app.vercel.app`
3. O añade dominio custom si lo tienes

## Paso 4: Deploy

1. Click en "Deploy"
2. Espera 2-3 minutos
3. ✅ Tu app estará en: `https://app-portalculture.vercel.app` o `https://portalculture-app.vercel.app`

## Paso 5: Configurar Webhook de Typeform

1. Ve a Typeform → Tu formulario
2. Settings → Webhooks
3. Add webhook URL: `https://TU-DOMINIO-VERCEL.vercel.app/api/typeform-webhook`
4. Save

## Paso 6: Verificar Supabase Redirect URLs

1. Ve a Supabase Dashboard
2. Authentication → URL Configuration
3. Añade estas URLs a "Redirect URLs":
   - `https://TU-DOMINIO-VERCEL.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (para desarrollo)

## ✅ Checklist Final

- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso (build sin errores)
- [ ] Página de login funciona
- [ ] OAuth Google/Discord funciona
- [ ] Registro + cuestionario funciona
- [ ] Webhook de Typeform configurado
- [ ] Panel admin accesible
- [ ] Integración Mailerlite funciona

## 🐛 Troubleshooting

### Build Error:
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs en Vercel

### Auth no funciona:
- Verifica las Redirect URLs en Supabase
- Comprueba las variables de entorno

### Webhook no recibe datos:
- Verifica la URL del webhook en Typeform
- Revisa los logs en Vercel → Functions

---

¡Listo! Tu app está en producción 🚀
