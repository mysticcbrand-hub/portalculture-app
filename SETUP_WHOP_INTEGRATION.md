# 🚀 Setup Completo - Integración Whop + Auto-registro Premium

## 📋 RESUMEN DEL FLOW

### **Flow para usuarios de PAGO (17€)**:
1. Usuario en `/seleccionar-acceso` → Click "Acceder ahora"
2. Fade to black → Abre Whop checkout en nueva pestaña
3. Usuario paga 17€ en Whop
4. **Whop redirige a**: `https://app.portalculture.com/api/generate-access-token?email={{customer_email}}`
5. Backend genera cuenta automáticamente (si no existe)
6. Backend crea magic link de acceso
7. Página de bienvenida con auto-redirect en 3s
8. Usuario entra directo al `/dashboard` con acceso completo

### **Flow para usuarios GRATIS (waitlist)**:
1. Usuario en `/seleccionar-acceso` → Click "Continuar gratis"
2. Abre `/cuestionario` en nueva pestaña
3. Completa Typeform → Webhook → Tabla `waitlist` (pending)
4. Admin aprueba en `/admin/waitlist`
5. Usuario crea cuenta manualmente en `/login`
6. Accede al `/dashboard`

---

## 🗄️ PASO 1: Crear tabla en Supabase

### **1.1 Ejecutar SQL**

Ve a Supabase Dashboard → SQL Editor → Ejecuta el archivo `supabase-premium-users.sql`

O copia y pega esto:

```sql
-- Tabla para usuarios premium (pagados via Whop)
CREATE TABLE IF NOT EXISTS premium_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  whop_user_id TEXT,
  whop_membership_id TEXT,
  whop_product_id TEXT,
  payment_status TEXT DEFAULT 'active' CHECK (payment_status IN ('active', 'inactive', 'cancelled')),
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
CREATE INDEX IF NOT EXISTS idx_premium_users_whop_user_id ON premium_users(whop_user_id);

-- RLS Policies
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own premium status"
  ON premium_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
  ON premium_users FOR ALL
  USING (auth.role() = 'service_role');
```

### **1.2 Verificar**
```sql
SELECT * FROM premium_users LIMIT 1;
```

---

## ⚙️ PASO 2: Configurar Variables de Entorno

### **2.1 Añadir en Vercel**

Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables

Añade:

```bash
# Ya existe (verificar que esté)
NEXT_PUBLIC_SUPABASE_URL=https://dzbmnumpzdhydfkjmlif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu anon key]
SUPABASE_SERVICE_ROLE_KEY=[tu service role key]

# Nueva - URL de la app
NEXT_PUBLIC_APP_URL=https://app.portalculture.com

# Nueva - Secret de Whop webhook (opcional pero recomendado)
WHOP_WEBHOOK_SECRET=[generar en Whop dashboard]
```

### **2.2 Añadir en .env.local (desarrollo)**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dzbmnumpzdhydfkjmlif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
WHOP_WEBHOOK_SECRET=tu_secret_de_whop
```

---

## 🔗 PASO 3: Configurar Whop

### **3.1 Configurar Webhook**

1. Ve a https://dash.whop.com/settings/developer
2. Click "Add Webhook"
3. **Webhook URL**: `https://app.portalculture.com/api/whop-webhook`
4. **Events** (selecciona estos):
   - `payment.succeeded`
   - `membership.went_valid`
   - `membership.went_invalid` (opcional, para cancelaciones)
5. **Secret**: Genera uno y guárdalo en `WHOP_WEBHOOK_SECRET`
6. Click "Save"

### **3.2 Configurar Redirect URL del Producto**

1. Ve a tu producto en Whop Dashboard
2. Settings → Success URL
3. Configura: `https://app.portalculture.com/api/generate-access-token?email={{customer_email}}`
4. Save

**Variables disponibles de Whop**:
- `{{customer_email}}` - Email del comprador
- `{{customer_name}}` - Nombre del comprador
- `{{order_id}}` - ID del pedido

---

## 🧪 PASO 4: Testing

### **4.1 Test Local (Desarrollo)**

```bash
cd ~/Desktop/app
npm run dev
```

**Simular compra**:
```bash
# Test del endpoint generate-access-token
curl "http://localhost:3000/api/generate-access-token?email=test@example.com"

# Test del webhook (simular evento de Whop)
curl -X POST http://localhost:3000/api/whop-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.succeeded",
    "data": {
      "id": "mem_test123",
      "user": {
        "id": "user_test123",
        "email": "test@example.com",
        "username": "testuser"
      },
      "product": {
        "id": "prod_test123"
      }
    }
  }'
```

### **4.2 Test en Producción**

1. **Deploy a Vercel**:
```bash
git add .
git commit -m "✅ Integración Whop completa"
git push origin main
```

2. **Verificar logs**:
   - Vercel Dashboard → Tu proyecto → Logs
   - Ver eventos en tiempo real

3. **Test de compra real**:
   - Ir a `https://app.portalculture.com/seleccionar-acceso`
   - Click en "Acceder ahora"
   - Completar compra en Whop con email de prueba
   - Verificar que redirige correctamente
   - Verificar que crea usuario en Supabase

---

## 🔍 PASO 5: Verificación

### **5.1 Verificar en Supabase**

Después de una compra, verifica:

```sql
-- Ver usuarios premium
SELECT * FROM premium_users ORDER BY created_at DESC;

-- Ver usuarios creados vía pago
SELECT 
  u.email,
  u.created_at,
  u.user_metadata->>'source' as source
FROM auth.users u
WHERE u.user_metadata->>'source' = 'whop_payment'
ORDER BY u.created_at DESC;

-- Verificar acceso
SELECT 
  p.email,
  p.access_status,
  pr.payment_status,
  pr.access_granted
FROM profiles p
LEFT JOIN premium_users pr ON p.id = pr.user_id
WHERE pr.payment_status = 'active';
```

### **5.2 Verificar logs de Whop**

1. Ve a Whop Dashboard → Settings → Developer → Webhooks
2. Click en tu webhook
3. Ver "Recent Deliveries"
4. Verificar que los eventos se enviaron correctamente (200 OK)

---

## 🛠️ TROUBLESHOOTING

### **Error: "No se pudo generar el enlace de acceso"**

**Causa**: Service role key incorrecta o no configurada

**Solución**:
```bash
# Verificar en Vercel que SUPABASE_SERVICE_ROLE_KEY esté correcta
# Debe ser diferente de ANON_KEY (más larga)
```

### **Error: "Tabla premium_users no existe"**

**Causa**: No se ejecutó el SQL en Supabase

**Solución**: Ejecuta el paso 1.1 de nuevo

### **Webhook no se ejecuta**

**Causa**: URL incorrecta o eventos no seleccionados

**Solución**:
1. Verificar URL en Whop: `https://app.portalculture.com/api/whop-webhook`
2. Verificar que seleccionaste `payment.succeeded` y `membership.went_valid`
3. Hacer test delivery desde Whop Dashboard

### **Usuario creado pero no tiene acceso**

**Causa**: No se creó registro en `premium_users`

**Solución**:
```sql
-- Crear manualmente
INSERT INTO premium_users (user_id, email, payment_status, access_granted)
VALUES ('uuid-del-usuario', 'email@example.com', 'active', true);
```

---

## 📊 MONITOREO

### **Dashboard queries útiles**

```sql
-- Total usuarios premium
SELECT COUNT(*) as total_premium 
FROM premium_users 
WHERE payment_status = 'active';

-- Ingresos por día (último mes)
SELECT 
  DATE(purchased_at) as fecha,
  COUNT(*) as compras,
  COUNT(*) * 17 as ingresos_euros
FROM premium_users
WHERE purchased_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(purchased_at)
ORDER BY fecha DESC;

-- Usuarios que cancelaron
SELECT * FROM premium_users 
WHERE payment_status = 'cancelled' 
ORDER BY cancelled_at DESC;
```

---

## ✅ CHECKLIST FINAL

- [ ] Tabla `premium_users` creada en Supabase
- [ ] Políticas RLS configuradas
- [ ] Variables de entorno añadidas en Vercel
- [ ] Webhook configurado en Whop
- [ ] Success URL configurada en producto Whop
- [ ] Deploy realizado a Vercel
- [ ] Test de compra realizado exitosamente
- [ ] Usuario creado automáticamente
- [ ] Acceso al dashboard funcionando
- [ ] Logs verificados (sin errores)

---

## 🎯 RESULTADO FINAL

**Después de esta configuración**:

✅ Usuario paga → Cuenta creada automáticamente  
✅ Email de bienvenida con magic link  
✅ Acceso inmediato al dashboard  
✅ Discord + 5 Templos + NOVA AI  
✅ Acceso de por vida mientras pago activo  
✅ Sistema robusto e inquebrantable  

**El flow está completo y optimizado al máximo nivel.**
