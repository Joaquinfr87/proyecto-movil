-- ============================================================
-- T-036 fix: rol en user_metadata para los usuarios del seed
-- El cliente lee user_metadata.role para mostrar el botón de subida
-- de imágenes (solo admin). Sin esto, el botón nunca aparece.
-- Idempotente: seguro en local y en cloud.
-- ============================================================

UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'admin@test.com';

UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"gestor"}'::jsonb
WHERE email = 'gestor@test.com';

UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"asistente"}'::jsonb
WHERE email = 'asistente@test.com';
