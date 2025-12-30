# 🔒 Configuración SEGURA de Supabase - Portal Culture

## ⚠️ CRÍTICO: Debes configurar esto AHORA en Supabase

He eliminado el soporte para implicit flow (inseguro) y ahora SOLO usamos PKCE (seguro).

---

## 📋 PASOS OBLIGATORIOS:

### 1️⃣ Activar PKCE Flow (OBLIGATORIO)

**Ve a tu proyecto Supabase:**
https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/settings/auth

**Busca la opción:**
- "Enable PKCE flow" o "Flow Type"
- Si ves opciones, selecciona: **"PKCE" o "Authorization Code Flow"**
- **DESMARCA** o **DESACTIVA**: "Implicit Flow" si existe

**¿Por qué?**
- ✅ PKCE = Tokens seguros, no expuestos en URL
- ❌ Implicit = Tokens en URL hash, menos seguro

---

### 2️⃣ Verificar URLs de Redirección

**En la misma página de Auth Settings, verifica:**

**Site URL:**
```
https://app-portalculture.vercel.app
```

**Redirect URLs (debe incluir TODAS estas):**
```
https://app-portalculture.vercel.app/**
https://app-portalculture.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

---

### 3️⃣ Configurar Session Settings (Seguridad)

**Busca estas opciones y configúralas:**

**JWT Expiry Time:**
```
3600 (1 hora)
```

**Refresh Token Rotation:**
```
✅ ACTIVADO (Enabled)
```

**Refresh Token Reuse Interval:**
```
10 (segundos)
```

**Enable Anonymous Sign-ins:**
```
❌ DESACTIVADO (por seguridad)
```

---

### 4️⃣ Rate Limiting (Protección contra ataques)

**Email Rate Limit:**
```
3 por hora (anti-spam)
```

**SMS Rate Limit:**
```
3 por hora
```

---

### 5️⃣ Security Settings

**Enable Email Confirmations:**
```
✅ ACTIVADO (para nuevos registros con email/password)
```

**Secure Email Change:**
```
✅ ACTIVADO (requiere confirmación en ambos emails)
```

**Minimum Password Length:**
```
8 caracteres mínimo
```

---

## 🔐 Configuración de OAuth Providers

### Google OAuth:

1. **En Google Cloud Console:**
   - Authorized redirect URIs: `https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback`
   - ✅ PKCE habilitado

2. **En Supabase (Google provider settings):**
   - Skip nonce check: ❌ DESACTIVADO (más seguro)
   
### Discord OAuth:

1. **En Discord Developer Portal:**
   - Redirect URI: `https://dzbmnumpzdhydfkjmlif.supabase.co/auth/v1/callback`

2. **En Supabase (Discord provider settings):**
   - Los valores por defecto están bien

---

## ✅ Checklist Final:

- [ ] PKCE Flow activado
- [ ] Implicit Flow desactivado
- [ ] URLs de redirección correctas
- [ ] JWT expiry en 3600s
- [ ] Refresh token rotation activado
- [ ] Anonymous sign-ins desactivado
- [ ] Email confirmations activado
- [ ] Rate limiting configurado
- [ ] Password mínimo 8 caracteres
- [ ] Google OAuth con PKCE
- [ ] Discord OAuth configurado

---

## 🧪 Después de Configurar:

1. **Limpia el caché:**
   - Cierra sesión de la app
   - Limpia cookies del navegador
   - Ctrl+Shift+R para hard refresh

2. **Prueba el flujo:**
   - Ve a https://app-portalculture.vercel.app
   - Click "Iniciar sesión con Google"
   - Debería redirigir a `/auth/callback?code=...` (NO hash)
   - Luego al dashboard sin errores en consola

3. **Verifica la consola:**
   - NO deberían haber errores de fetch
   - NO deberían haber warnings de Supabase
   - Session debería persistir correctamente

---

## 🚨 Si ves errores después de configurar:

1. Verifica que el deploy de Vercel haya terminado
2. Limpia caché del navegador completamente
3. Prueba en ventana incógnita
4. Verifica que las URLs en Supabase estén exactas

---

**Cuando termines de configurar todo, prueba y dime si funciona perfectamente! 🚀**
