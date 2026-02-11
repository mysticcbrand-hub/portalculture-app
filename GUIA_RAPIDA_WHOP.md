# 🚀 GUÍA RÁPIDA - Configuración Whop en 10 minutos

## ✅ PASO 1: Ejecutar SQL en Supabase (2 minutos)

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `dzbmnumpzdhydfkjmlif`
3. Click en **SQL Editor** (barra lateral izquierda)
4. Click en **"New Query"**
5. Copia y pega esto:

```sql
-- Crear tabla premium_users
CREATE TABLE IF NOT EXISTS premium_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  whop_user_id TEXT,
  whop_membership_id TEXT,
  whop_product_id TEXT,
  payment_status TEXT DEFAULT 'active',
  access_granted BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_email ON premium_users(email);

-- Activar RLS
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Borrar policies existentes si las hay
DROP POLICY IF EXISTS "Users can view own premium status" ON premium_users;
DROP POLICY IF EXISTS "Service role has full access" ON premium_users;

-- Crear policies
CREATE POLICY "Users can view own premium status"
  ON premium_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
  ON premium_users FOR ALL
  USING (auth.role() = 'service_role');
```

6. Click en **"Run"** (botón verde abajo a la derecha)
7. Deberías ver: **"Success. No rows returned"**

---

## ✅ PASO 2: Añadir Variable en Vercel (1 minuto)

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: **portalculture-app**
3. Click en **Settings** (arriba)
4. Click en **Environment Variables** (barra lateral izquierda)
5. Click en **"Add New"**
6. Añade:

```
Name: NEXT_PUBLIC_APP_URL
Value: https://app.portalculture.com
```

7. Click en **"Save"**

**NOTA**: Las demás variables ya existen, NO las toques.

---

## ✅ PASO 3: Configurar Webhook en Whop (3 minutos)

1. Ve a: https://dash.whop.com/settings/developer
2. Click en **"Webhooks"**
3. Click en **"Add Webhook"** o **"Create Webhook"**
4. Rellena:

```
Webhook URL: https://app.portalculture.com/api/whop-webhook
Description: Portal Culture - Auto registro premium
```

5. Selecciona estos **Events** (marca las casillas):
   - ✅ `payment.succeeded`
   - ✅ `membership.went_valid`
   - ✅ `membership.went_invalid` (opcional)

6. **Secret**: Déjalo VACÍO (no es necesario por ahora)

7. Click en **"Save"** o **"Create"**

8. **IMPORTANTE**: Copia la URL del webhook que acabas de crear (debería ser: `https://app.portalculture.com/api/whop-webhook`)

---

## ✅ PASO 4: Configurar Success URL en tu Producto (2 minutos)

1. En Whop Dashboard, ve a **Products** (barra lateral)
2. Busca tu producto: **"Acceso Inmediato"** (o como se llame el de 17€)
3. Click en el producto para editarlo
4. Busca la sección **"Redirect URL"** o **"Success URL"** o **"After Purchase URL"**
5. Pega esto:

```
https://app.portalculture.com/api/generate-access-token?email={{customer_email}}
```

6. Click en **"Save"** o **"Update"**

**NOTA**: `{{customer_email}}` es una variable de Whop que se reemplaza automáticamente con el email del comprador.

---

## ✅ PASO 5: Verificar que todo funciona (2 minutos)

### **5.1 Verificar que el webhook está activo**

Abre en tu navegador:
```
https://app.portalculture.com/api/whop-webhook
```

Deberías ver algo como:
```json
{
  "status": "ok",
  "message": "Whop webhook endpoint is active",
  "methods": ["POST"],
  "events": ["payment.succeeded", "membership.went_valid"]
}
```

✅ Si ves esto = **Webhook funcionando**

### **5.2 Verificar que la tabla existe**

1. Ve a Supabase → **Table Editor** (barra lateral)
2. Busca la tabla **`premium_users`**
3. Debería aparecer en la lista

✅ Si aparece = **Tabla creada correctamente**

### **5.3 Verificar variables de entorno**

1. Ve a Vercel → Tu proyecto → Settings → Environment Variables
2. Busca: **`NEXT_PUBLIC_APP_URL`**
3. Debería tener valor: `https://app.portalculture.com`

✅ Si aparece = **Variable configurada**

---

## 🎯 PASO 6: Test de Compra Real (OPCIONAL - 5 minutos)

**SOLO si quieres probar antes de ir a producción**:

1. Ve a: https://app.portalculture.com/seleccionar-acceso
2. Click en **"Acceder ahora"** (opción premium)
3. Se abre Whop → Completa el pago con un email de prueba
4. Después de pagar, Whop te redirige a una página de bienvenida
5. Espera 3 segundos → Auto-redirect al dashboard
6. ✅ Deberías entrar directamente con acceso completo

**Verificar en Supabase**:
1. Ve a Table Editor → `premium_users`
2. Deberías ver un nuevo registro con tu email
3. `payment_status` = `active`
4. `access_granted` = `true`

---

## ❓ TROUBLESHOOTING

### **Error: "Tabla premium_users no existe"**

**Solución**: Vuelve al PASO 1 y ejecuta el SQL de nuevo.

### **Error: "policy already exists"**

**Solución**: El SQL tiene `DROP POLICY IF EXISTS`, debería funcionar. Si sigue fallando:

```sql
-- Ejecuta esto primero:
DROP TABLE IF EXISTS premium_users CASCADE;

-- Luego ejecuta el SQL del PASO 1 completo
```

### **Webhook no se ejecuta después de compra**

**Solución**:
1. Verifica que la URL del webhook sea exactamente: `https://app.portalculture.com/api/whop-webhook`
2. Verifica que seleccionaste los eventos: `payment.succeeded` y `membership.went_valid`
3. En Whop Dashboard → Developer → Webhooks → Click en tu webhook → Ver "Recent Deliveries"
4. Si hay errores, verás el código HTTP (ej: 500, 404, etc.)

### **Usuario paga pero no puede acceder**

**Solución**: Verifica en Supabase → Table Editor → `premium_users`:

```sql
-- Ver usuarios premium
SELECT * FROM premium_users ORDER BY created_at DESC LIMIT 5;
```

Si no hay registros = El webhook no se ejecutó. Revisa el PASO 3.

---

## ✅ CHECKLIST FINAL

Marca cuando hayas completado:

- [ ] SQL ejecutado en Supabase (tabla `premium_users` creada)
- [ ] Variable `NEXT_PUBLIC_APP_URL` añadida en Vercel
- [ ] Webhook configurado en Whop con URL correcta
- [ ] Events seleccionados: `payment.succeeded`, `membership.went_valid`
- [ ] Success URL configurada en producto Whop
- [ ] Verificado que `/api/whop-webhook` responde OK
- [ ] (Opcional) Test de compra realizado exitosamente

---

## 🎉 ¡LISTO!

Si todos los checks están ✅, el sistema está funcionando.

**Cada vez que alguien pague**:
1. Whop envía evento al webhook
2. Se crea cuenta automáticamente
3. Usuario redirigido con magic link
4. Acceso inmediato al dashboard

**No más pasos manuales. Todo automático. Todo optimizado.**
