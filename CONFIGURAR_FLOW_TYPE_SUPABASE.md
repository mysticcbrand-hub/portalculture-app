# 🔧 Cambiar OAuth Flow Type en Supabase

## ⚠️ IMPORTANTE: Debes hacer esto en Supabase

Actualmente Supabase está usando **implicit flow** (tokens en el hash #), pero es mejor usar **PKCE flow** (code en query params).

## 📝 Pasos para cambiar a PKCE:

### 1. Ve a Supabase Dashboard
URL: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/settings/auth

### 2. Busca la sección "Auth Settings"

### 3. Encuentra "Flow Type" o "OAuth Flow"
- Debería estar en: **Authentication > Settings**
- O en: **Project Settings > Auth**

### 4. Cambia de "implicit" a "pkce"
- **Implicit Flow**: Tokens en el hash fragment (#access_token=...)
- **PKCE Flow**: Code en query params (?code=...) - MÁS SEGURO ✅

### 5. Guarda los cambios

---

## ✅ Beneficios de PKCE:
- ✅ Más seguro
- ✅ Funciona mejor con SSR
- ✅ Tokens no expuestos en la URL
- ✅ Estándar recomendado

## 🔄 Mientras tanto:
He creado un sistema que maneja AMBOS flujos:
- `/auth/callback` - Maneja PKCE (code)
- `/auth/confirm` - Maneja implicit (hash tokens)

Así funcionará con cualquier configuración que tengas activa.

---

## 🧪 Después de cambiar:
1. Prueba login con Google
2. Debería redirigir a `/auth/callback?code=...`
3. Y luego al dashboard sin problemas
