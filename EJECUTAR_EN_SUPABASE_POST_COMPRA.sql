-- ============================================
-- SQL para Cuestionario Post-Compra
-- ============================================
-- Ve a: https://supabase.com/dashboard
-- Proyecto: dzbmnumpzdhydfkjmlif
-- SQL Editor → New Query → Pega esto y ejecuta
-- ============================================

-- Crear tabla para respuestas post-compra
CREATE TABLE IF NOT EXISTS post_compra_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Respuestas
  valor_mensual INTEGER NOT NULL,
  top3_cosas TEXT[] NOT NULL,
  otro_top3 TEXT,
  probabilidad_6_meses INTEGER NOT NULL CHECK (probabilidad_6_meses >= 1 AND probabilidad_6_meses <= 10),
  motivacion_seguir TEXT NOT NULL,
  ayuda_portal TEXT NOT NULL,
  menos_gustado TEXT NOT NULL,
  preferencia_aprendizaje TEXT NOT NULL,
  vida_en_2_anos TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Un usuario solo puede responder una vez
  UNIQUE(user_id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_post_compra_user_id ON post_compra_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_post_compra_created_at ON post_compra_responses(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE post_compra_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden insertar sus propias respuestas
CREATE POLICY "Users can insert own responses"
  ON post_compra_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuarios pueden ver sus propias respuestas
CREATE POLICY "Users can view own responses"
  ON post_compra_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admin puede ver todas las respuestas
CREATE POLICY "Admin can view all responses"
  ON post_compra_responses
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'mysticcbrand@gmail.com'
  );

-- Verificar que se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'post_compra_responses'
ORDER BY ordinal_position;

-- ============================================
-- Deberías ver estas columnas:
-- - id (uuid)
-- - user_id (uuid)
-- - valor_mensual (integer)
-- - top3_cosas (ARRAY)
-- - otro_top3 (text)
-- - probabilidad_6_meses (integer)
-- - motivacion_seguir (text)
-- - ayuda_portal (text)
-- - menos_gustado (text)
-- - preferencia_aprendizaje (text)
-- - vida_en_2_anos (text)
-- - created_at (timestamp)
-- ============================================
