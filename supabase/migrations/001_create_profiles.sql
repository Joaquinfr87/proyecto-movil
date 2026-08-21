-- ============================================================
-- Migration: 001_create_profiles
-- Tabla basica de perfiles vinculada a auth.users
-- ============================================================

-- Extension para geolocalizacion (para futuro uso con escenarios)
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Tipos de rol
CREATE TYPE public.user_role AS ENUM ('admin', 'gestor', 'asistente');

-- Tabla de perfiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'asistente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
-- Cualquier usuario autenticado puede ver perfiles
CREATE POLICY "profiles_select_auth"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Cada usuario solo puede actualizar su propio perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Solo el admin puede ver todos los perfiles y cambiar roles
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger: auto-crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'asistente')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
