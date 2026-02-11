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
  
  -- Constraints
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_email ON premium_users(email);
CREATE INDEX IF NOT EXISTS idx_premium_users_whop_user_id ON premium_users(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_payment_status ON premium_users(payment_status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_premium_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER premium_users_updated_at
  BEFORE UPDATE ON premium_users
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_users_updated_at();

-- RLS Policies
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver su propio registro
CREATE POLICY "Users can view own premium status"
  ON premium_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role puede hacer todo (para webhook)
CREATE POLICY "Service role has full access"
  ON premium_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Función helper para verificar si un usuario es premium
CREATE OR REPLACE FUNCTION is_premium_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM premium_users 
    WHERE user_id = check_user_id 
      AND payment_status = 'active' 
      AND access_granted = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE premium_users IS 'Usuarios que han pagado via Whop y tienen acceso premium';
COMMENT ON COLUMN premium_users.payment_status IS 'Estado del pago: active, inactive, cancelled';
COMMENT ON COLUMN premium_users.access_granted IS 'Si el usuario tiene acceso actualmente (puede ser false si canceló)';
