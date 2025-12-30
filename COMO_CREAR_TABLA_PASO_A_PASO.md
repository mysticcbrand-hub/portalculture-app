# 📝 Cómo Crear la Tabla en Supabase - Paso a Paso

## 🎯 **Opción 1: Un solo query (RECOMENDADO)**

### Paso 1: Abre el SQL Editor
1. Ve a: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/sql
2. Verás el editor de SQL

### Paso 2: Copia TODO el contenido del archivo
1. Abre: `/Users/mario/Desktop/app/CREAR_TABLA_SUPABASE.sql`
2. Selecciona TODO (Cmd+A)
3. Copia (Cmd+C)

### Paso 3: Pega y Ejecuta
1. Pega en el editor de Supabase
2. Click en el botón verde "Run" (esquina inferior derecha)
3. Espera 2-3 segundos

### Paso 4: Verifica
✅ Deberías ver: "Success. No rows returned"
✅ Si sale error, cópialo y dímelo

---

## 🎯 **Opción 2: Queries separados**

Si prefieres hacerlo por partes:

### Query 1: Crear la tabla
```sql
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  typeform_response_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```
👆 Ejecuta este primero, luego...

### Query 2: Crear índices
```sql
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_submitted_at ON waitlist(submitted_at DESC);
```
👆 Ejecuta este segundo, luego...

### Query 3: Habilitar seguridad
```sql
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
```
👆 Ejecuta este tercero, luego...

### Query 4: Crear políticas de seguridad
```sql
CREATE POLICY "Admin can view all waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'mysticcbrand@gmail.com'
  );

CREATE POLICY "Admin can update waitlist"
  ON waitlist FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'mysticcbrand@gmail.com'
  );

CREATE POLICY "Admin can insert waitlist"
  ON waitlist FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'mysticcbrand@gmail.com'
  );

CREATE POLICY "Service role can insert"
  ON waitlist FOR INSERT
  TO service_role
  WITH CHECK (true);
```
👆 Ejecuta este último

---

## ✅ **Verificar que funcionó:**

### Método 1: Visual
1. Ve a: https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/editor
2. Deberías ver la tabla "waitlist" en la lista izquierda
3. Click en ella
4. Verás las columnas vacías

### Método 2: SQL
Ejecuta este query:
```sql
SELECT * FROM waitlist;
```
✅ Debería devolver "Success. No rows returned" (porque está vacía)

---

## 🔒 **Verificar la Seguridad:**

### Test 1: Ver las políticas creadas
```sql
SELECT * FROM pg_policies WHERE tablename = 'waitlist';
```
✅ Deberías ver 4 políticas listadas

### Test 2: Probar acceso
Cuando estés logueado con `mysticcbrand@gmail.com`, ve a:
https://app-portalculture.vercel.app/admin/waitlist

✅ Si puedes ver la página = Seguridad funciona
❌ Si no puedes = Hay un problema

---

## 🐛 **Errores Comunes:**

### Error: "relation waitlist already exists"
**Solución**: La tabla ya existe, no necesitas crearla de nuevo.

### Error: "permission denied for table waitlist"
**Solución**: Las políticas no se aplicaron. Ejecuta solo el Query 4 de nuevo.

### Error: "policy already exists"
**Solución**: Las políticas ya existen. Todo está bien, continúa.

---

## 💡 **Consejo Pro:**

**Usa la Opción 1** (un solo query) porque:
- ✅ Más rápido
- ✅ Menos errores
- ✅ Todo se crea en orden correcto
- ✅ Si falla algo, falla todo (no quedas a medias)

---

¿Dudas? ¡Pregúntame! 🚀
