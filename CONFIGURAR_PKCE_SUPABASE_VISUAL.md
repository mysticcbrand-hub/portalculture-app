# 🔧 Cómo Configurar PKCE Flow en Supabase - Guía Visual

## ⚠️ IMPORTANTE: Esto es OPCIONAL pero recomendado

**¿Ya funciona el login con Google?**
- ✅ Si funciona → PKCE ya está activado por defecto
- ❌ Si NO funciona → Sigue esta guía

---

## 📍 **Dónde encontrar la configuración:**

### **Opción 1: En Authentication Settings (Nuevo Dashboard)**

1. Ve a tu proyecto: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif

2. Sidebar izquierdo → Click en **"Authentication"**

3. Luego click en **"Settings"** (icono de engranaje arriba a la derecha)

4. Scroll down hasta encontrar una de estas secciones:
   - "Auth Flow Settings"
   - "Flow Type"
   - "OAuth Settings"

5. Busca una opción que diga:
   - **"PKCE Flow"** → Asegúrate que esté ACTIVADO ✅
   - **"Implicit Flow"** → Asegúrate que esté DESACTIVADO ❌

---

## 🔍 **Si NO encuentras la opción:**

**¡TRANQUILO! Es normal.** En las versiones nuevas de Supabase:

### **PKCE está activado por defecto** ✅

Esto significa que **ya tienes PKCE configurado** si:
- Creaste tu proyecto después de 2023
- No has cambiado nada en Auth Settings

### **Verificación rápida:**

Prueba el login con Google:
1. Ve a: https://app-portalculture.vercel.app
2. Click "Iniciar sesión con Google"
3. Mira la URL después de autenticar:

**✅ PKCE activado si ves:**
```
https://app-portalculture.vercel.app/auth/callback?code=abc123...
```
(Tiene `?code=` en la URL)

**❌ Implicit si ves:**
```
https://app-portalculture.vercel.app/#access_token=abc123...
```
(Tiene `#access_token=` en la URL)

---

## 🎯 **Configuración Manual (si es necesario):**

Si encontraste la opción pero está mal configurada:

### **Settings a cambiar:**

```
Flow Type: PKCE  ✅
Enable PKCE: ON  ✅
Implicit Flow: OFF  ❌
```

### **Otras configuraciones importantes:**

Mientras estás en **Authentication > Settings**, verifica:

#### **1. Session Settings:**
```
JWT Expiry Time: 3600 (1 hora)
Refresh Token Rotation: ON ✅
Refresh Token Reuse Interval: 10
```

#### **2. Security Settings:**
```
Enable Email Confirmations: ON ✅
Secure Email Change: ON ✅
Minimum Password Length: 8
```

#### **3. Rate Limiting:**
```
Email Rate Limit: 3 per hour
SMS Rate Limit: 3 per hour
```

---

## ✅ **Cómo saber si todo está bien:**

### **Test 1: Login funciona sin errores**
1. Ve a la app
2. Login con Google
3. No hay errores en consola ✅
4. Te lleva al dashboard ✅

### **Test 2: Sesión persiste**
1. Después de login, recarga la página
2. Sigues logueado ✅
3. No te redirige a login ✅

### **Test 3: No hay errores de fetch**
1. Abre consola (F12)
2. Login con Google
3. NO ves errores de "Invalid value" o "fetch" ✅

---

## 🆘 **Si NADA de esto funciona:**

### **Última Opción: Configurar en SQL**

Ejecuta este query en Supabase SQL Editor:

```sql
-- Ver configuración actual
SELECT 
  raw_app_meta_data->>'providers' as auth_providers
FROM auth.users 
LIMIT 1;
```

Si ves problemas, dime qué aparece y te ayudo.

---

## 💡 **IMPORTANTE:**

**La mayoría de proyectos nuevos de Supabase ya tienen PKCE activado.**

Si tu login con Google funciona correctamente:
- ✅ NO necesitas cambiar nada
- ✅ PKCE ya está funcionando
- ✅ Sigue con los otros pasos del sistema

**Solo necesitas hacer esto si:**
- ❌ Login NO funciona
- ❌ Ves errores de "invalid value" o "fetch"
- ❌ URL tiene `#access_token` en lugar de `?code=`

---

¿Funciona tu login con Google? Si sí, ¡ya tienes PKCE! 🎉
