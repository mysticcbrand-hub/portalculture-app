-- ============================================
-- SQL para ejecutar en Supabase
-- ============================================
-- Ve a: https://supabase.com/dashboard
-- Proyecto: dzbmnumpzdhydfkjmlif
-- SQL Editor → New Query → Pega esto y ejecuta
-- ============================================

-- Añadir columnas faltantes para sistema de rechazos
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Verificar que se añadieron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'waitlist'
ORDER BY column_name;

-- ============================================
-- Después de ejecutar esto, deberías ver:
-- - approved_at (timestamp)
-- - created_at (timestamp)
-- - email (text)
-- - id (uuid)
-- - metadata (jsonb)
-- - name (text)
-- - rejected_at (timestamp) ← NUEVA
-- - rejection_reason (text) ← NUEVA
-- - status (text)
-- - submitted_at (timestamp)
-- - typeform_response_id (text)
-- - user_id (uuid)
-- ============================================
