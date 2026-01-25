-- =============================================
-- PORTAL CULTURE - DATABASE SETUP
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. CREAR TABLA PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  access_status TEXT DEFAULT 'none' CHECK (access_status IN ('none', 'pending', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can do everything" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_access_status ON public.profiles(access_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. ACTUALIZAR TABLA WAITLIST
-- =============================================
-- Añadir columna user_id si no existe
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Añadir columna phone si no existe
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Índice para user_id
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist(user_id);

-- 3. FUNCIÓN PARA AUTO-CREAR PROFILE AL REGISTRAR
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, access_status, created_at)
  VALUES (NEW.id, NEW.email, 'none', NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. FUNCIÓN PARA ACTUALIZAR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-actualizar updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. GRANT PERMISOS
-- =============================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- =============================================
-- FIN DEL SETUP
-- =============================================
