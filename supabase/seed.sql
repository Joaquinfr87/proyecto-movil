-- ============================================================
-- Seed: Usuarios de prueba - Lugares Interactivos
-- Todos usan password: password123
-- ============================================================

-- Usuario admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, confirmation_sent_at,
  recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  phone, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, reauthentication_token, reauthentication_sent_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('password123', gen_salt('bf', 10)),
  now(),
  '', NULL,
  '', NULL,
  '', '', NULL,
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","email":"admin@test.com","email_verified":true,"phone_verified":false}'::jsonb,
  now(),
  now(),
  NULL, '', '', NULL,
  '', '', NULL
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","email":"admin@test.com","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  now(),
  now(),
  now()
);

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@test.com',
  'Admin Test',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Usuario gestor (gestiona escenarios)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, confirmation_sent_at,
  recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  phone, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, reauthentication_token, reauthentication_sent_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'authenticated',
  'authenticated',
  'gestor@test.com',
  crypt('password123', gen_salt('bf', 10)),
  now(),
  '', NULL,
  '', NULL,
  '', '', NULL,
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"sub":"b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22","email":"gestor@test.com","email_verified":true,"phone_verified":false}'::jsonb,
  now(),
  now(),
  NULL, '', '', NULL,
  '', '', NULL
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '{"sub":"b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22","email":"gestor@test.com","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  now(),
  now(),
  now()
);

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'gestor@test.com',
  'Gestor Test',
  'gestor'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Usuario asistente (usuario final)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, confirmation_sent_at,
  recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  phone, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, reauthentication_token, reauthentication_sent_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'authenticated',
  'authenticated',
  'asistente@test.com',
  crypt('password123', gen_salt('bf', 10)),
  now(),
  '', NULL,
  '', NULL,
  '', '', NULL,
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"sub":"c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33","email":"asistente@test.com","email_verified":true,"phone_verified":false}'::jsonb,
  now(),
  now(),
  NULL, '', '', NULL,
  '', '', NULL
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  '{"sub":"c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33","email":"asistente@test.com","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  now(),
  now(),
  now()
);

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'asistente@test.com',
  'Asistente Test',
  'asistente'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
