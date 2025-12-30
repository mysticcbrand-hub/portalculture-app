-- ============================================
-- 🗄️ Tabla de Lista de Espera - Portal Culture
-- ============================================
-- Ejecuta este SQL en Supabase SQL Editor
-- https://app.supabase.com/project/dzbmnumpzdhydfkjmlif/sql

-- 1. Crear la tabla
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

-- 2. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_submitted_at ON waitlist(submitted_at DESC);

-- 3. Habilitar Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 4. Política: Solo tu email puede ver y editar
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

-- 5. Permitir insert desde service role (para webhook)
CREATE POLICY "Service role can insert"
  ON waitlist FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ✅ ¡Listo! Tabla creada con seguridad
