-- ============================================================
-- Seed: Lugares Interactivos - Bolivia
-- Usuarios de prueba + escenarios deportivos reales
-- Todos los usuarios usan password: password123
-- ============================================================

-- ============================================================
-- USUARIOS DE PRUEBA
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
  '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","email":"admin@test.com","email_verified":true,"phone_verified":false,"role":"admin"}'::jsonb,
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
  '{"sub":"b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22","email":"gestor@test.com","email_verified":true,"phone_verified":false,"role":"gestor"}'::jsonb,
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
  '{"sub":"c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33","email":"asistente@test.com","email_verified":true,"phone_verified":false,"role":"asistente"}'::jsonb,
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

-- ============================================================
-- DEPORTES
-- ============================================================

INSERT INTO public.sports (id, nombre, descripcion) VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Futbol', 'Deporte de equipo con balon, el mas popular del pais'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Basquetbol', 'Deporte de equipo con balon y aros'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Voleibol', 'Deporte de equipo con red y balon'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Futsal', 'Variacion de futbol en cancha reducida'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Handball', 'Deporte de equipo con balon y porteria'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'Tenis', 'Deporte de raqueta individual o en parejas'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 'Natacion', 'Deporte acuatico'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Atletismo', 'Carreras, saltos y lanzamientos'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09', 'Artes Marciales', 'Combate y disciplinas de defensa personal'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10', 'Ciclismo', 'Deporte de resistencia con bicicleta')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- ESCENARIOS DEPORTIVOS REALES DE BOLIVIA
-- ============================================================

INSERT INTO public.scenarios (id, nombre, tipo, descripcion, capacidad, direccion, latitud, longitud, estado, created_by) VALUES

-- La Paz
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
 'Estadio Hernando Siles',
 'Estadio',
 'El estadio de futbol mas grande de Bolivia, sede de la seleccion nacional y de los equipos paceños. Inaugurado en 1930 y renovado múltiples veces.',
 41143,
 'Av. Doctor Rosa Padilla, Zona Villa Fátima, La Paz',
 -16.4963,
 -68.1221,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
 'Coliseo Eduardo Leon',
 'Coliseo',
 'Principal coliseo cubierto de La Paz para basquetbol, voleibol y eventos de artes marciales.',
 7500,
 'Calle Eduardo Leon, Zaza, La Paz',
 -16.4896,
 -68.1193,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03',
 'Coliseo Ciudad de La Paz',
 'Coliseo',
 'Espacio multiuso para deportes de interior, conciertos y eventos culturales en la zona Sur de la ciudad.',
 5000,
 'Av. Arce esq. Calle 14, Zona Sur, La Paz',
 -16.5015,
 -68.1197,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

-- El Alto
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04',
 'Estadio Municipal de El Alto',
 'Estadio',
 'Estadio municipal de la ciudad de El Alto, usado por el Club Always Ready y para torneos locales.',
 25000,
 'Av. 16 de Julio, Zona 15 de Octubre, El Alto',
 -16.5143,
 -68.1247,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

-- Santa Cruz de la Sierra
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05',
 'Estadio Ramon Tahuichi Aguilera',
 'Estadio',
 'El estadio mas emblemático de Santa Cruz, sede de The Strongest, Oriente Petrolero y la seleccion cruceña. Inaugurado en 1944.',
 38000,
 'Av. Rotario, Santa Cruz de la Sierra',
 -17.7822,
 -63.1833,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06',
 'Coliseo de Deportes de Santa Cruz',
 'Coliseo',
 'Principal coliseo cubierto de Santa Cruz para basquetbol, voleibol, futsal y artes marciales.',
 8000,
 'Av. Roca y Bolton, Santa Cruz de la Sierra',
 -17.7729,
 -63.1785,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07',
 'Arena Magma Fest',
 'Coliseo',
 'Espacio multiuso para eventos deportivos, musicales y de entretenimiento en la zona este de la ciudad.',
 6000,
 'Av. Principal, Equipetrol, Santa Cruz de la Sierra',
 -17.7645,
 -63.1650,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

-- Cochabamba
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08',
 'Estadio Felix Capriles',
 'Estadio',
 'El estadio principal de Cochabamba, sede del Wilstermann y Aurora. Inaugurado en 1945 y remodelado para los Juegos Suramericanos 2018.',
 32000,
 'Av. Circunvalacion, Cochabamba',
 -17.4219,
 -66.1506,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09',
 'Coliseo de Deportes de Cochabamba',
 'Coliseo',
 'Coliseo multiproposito para eventos deportivos y culturales, usado en los Juegos Suramericanos 2018.',
 10000,
 'Av. Omero Kantuta, Zona Cala Cala, Cochabamba',
 -17.4138,
 -66.1374,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10',
 'Complejo Deportivo Capriles',
 'Complejo',
 'Complejo deportivo con canchas de tenis, futsal, natacion y atletismo en la zona norte de Cochabamba.',
 3000,
 'Zona Capriles, Cochabamba',
 -17.4044,
 -66.1444,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

-- Sucre
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11',
 'Estadio Olimpico Patria',
 'Estadio',
 'Estadio historico de Sucre, sede del Independiente y de eventos deportivos universitarios.',
 30000,
 'Av. Universitaria, Sucre',
 -19.0208,
 -65.2598,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

-- Potosi
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12',
 'Estadio Victor Agustin Ugarte',
 'Estadio',
 'El estadio mas alto del mundo a 3900 msnm, sede del Real Potosi y Nacional Potosi.',
 30000,
 'Av. Doctor Patiño, Potosi',
 -19.5739,
 -65.7582,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

-- Tarija
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13',
 'Estadio Carlos Villegras de la Quintana',
 'Estadio',
 'Estadio principal de Tarija, sede del Union Tarija y de la Liga Tarijena de Futbol.',
 18000,
 'Av. Sanchez de Bustamante, Tarija',
 -21.5330,
 -64.7328,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

-- Oruro
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14',
 'Estadio Jesus Bermudez',
 'Estadio',
 'Estadio de la ciudad minera, sede del San Jose de Oruro y de la Copa Sur Oscuro.',
 33000,
 'Av. Covendo, Oruro',
 -17.9547,
 -67.1158,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

-- Trinidad (Beni)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e15',
 'Estadio Melgar',
 'Estadio',
 'Estadio principal de Trinidad, sede del Universitario del Beni y eventos de la CONDEBOL.',
 25000,
 'Av. Ballivian, Trinidad, Beni',
 -14.8333,
 -64.9000,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

-- Canchas multiples
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16',
 'Canchas Multiples Zona Sur',
 'Cancha multiple',
 'Complejo de canchas de futsal, basquetbol y voleibol al aire libre en la zona sur de La Paz.',
 500,
 'Av. Hernando Siles, Zona Sur, La Paz',
 -16.5083,
 -68.1208,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e17',
 'Canchas Multiples Urkupiña',
 'Cancha multiple',
 'Canchas comunitarias de futsal y voleibol en el corazon de la zona Urkupiña, Cochabamba.',
 400,
 'Av. Urkupiña, Zona Urkupiña, Cochabamba',
 -17.4025,
 -66.1533,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18',
 'Canchas Multiples Equipetrol',
 'Cancha multiple',
 'Espacio deportivo con canchas de paddle, tenis y futsal en la zona comercial de Equipetrol.',
 300,
 'Calle 3er Anillo, Equipetrol, Santa Cruz',
 -17.7633,
 -63.1625,
 'activo',
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19',
 'Polideportivo Villa Ignacio',
 'Polideportivo',
 'Centro deportivo municipal con piscina, canchas de basquetbol, voleibol y gimnasio.',
 2000,
 'Av. Washington, Villa Ignacio, Santa Cruz',
 -17.7778,
 -63.1806,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),

('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20',
 'Club de Tenis La Paz',
 'Club deportivo',
 'Club privado con 6 canchas de tenis, piscina olimpica y canchas de squash en la zona Sur.',
 1200,
 'Av. Ballivian esq. Calle 16, Zona Sur, La Paz',
 -16.5042,
 -68.1192,
 'activo',
 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- ============================================================
-- RELACION ESCENARIO - DEPORTE
-- ============================================================

-- Estadio Hernando Siles: futbol + atletismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

-- Coliseo Eduardo Leon: basquetbol, voleibol, handball, artes marciales
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09');

-- Coliseo Ciudad de La Paz: basquetbol, voleibol, futsal
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04');

-- Estadio Municipal de El Alto: futbol
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01');

-- Estadio Tahuichi Aguilera: futbol, atletismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

-- Coliseo Deportes SC: basquetbol, voleibol, futsal, handball
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05');

-- Arena Magma Fest: basquetbol, voleibol, artes marciales
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09');

-- Estadio Felix Capriles: futbol, atletismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

-- Coliseo Deportes CBBA: basquetbol, voleibol, futsal, handball, artes marciales
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09');

-- Complejo Deportivo Capriles: tenis, futsal, natacion, atletismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

-- Estadio Olimpico Patria: futbol, atletismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

-- Estadio Victor Agustin Ugarte: futbol
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01');

-- Estadio Carlos Villegras: futbol
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01');

-- Estadio Jesus Bermudez: futbol, ciclismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10');

-- Estadio Melgar: futbol, atletismo
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e15', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e15', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08');

-- Canchas Multiples Zona Sur: futsal, basquetbol, voleibol
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03');

-- Canchas Multiples Urkupiña: futsal, voleibol
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e17', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e17', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03');

-- Canchas Multiples Equipetrol: futsal, tenis, paddle (asociado a tenis)
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06');

-- Polideportivo Villa Ignacio: natacion, basquetbol, voleibol
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03');

-- Club de Tenis La Paz: tenis, natacion
INSERT INTO public.scenario_sports (scenario_id, sport_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07');

-- ============================================================
-- EVENTOS
-- ============================================================

INSERT INTO public.events (scenario_id, nombre, fecha, hora, descripcion) VALUES

-- La Paz - Hernando Siles
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Clasificatorio Mundial Bolivia vs Brasil', '2026-09-15', '20:00', 'Partido clasificatorio para el Mundial 2026 en la altitude paceña'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Final Liga de Futbol Profesional', '2026-12-20', '18:00', 'Gran final del torneo Apertura 2026'),

-- El Alto
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'Torneo Intercultural de Futbol', '2026-10-12', '14:00', 'Torneo comunitario entre barrios de El Alto'),

-- Santa Cruz - Tahuichi
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'Copa Autonomous Nacional', '2026-11-08', '19:30', 'Partido de cuartos de final de la Copa Nacional'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'Clasificatorio Santa Cruz vs Argentina', '2026-10-10', '20:00', 'Eliminatorias sudamericanas en el Tahuichi'),

-- Santa Cruz - Coliseo Deportes
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06', 'Liga Nacional de Basquetbol', '2026-09-20', '19:00', 'Fecha 8 de la Liga Nacional'),

-- Cochabamba - Felix Capriles
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08', 'Super clasico Wilstermann vs Aurora', '2026-09-25', '20:00', 'El partido mas esperado del futbol cochabambino'),

-- Cochabamba - Coliseo Deportes
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09', 'Torneo Interuniversitario de Voleibol', '2026-11-05', '15:00', 'Campeonato universitario regional'),

-- Potosi
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'Futbol en la altura', '2026-10-01', '15:00', 'Real Potosi vs The Strongest en el estadio mas alto del mundo'),

-- Tarija
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13', 'Torneo de Verano Tarija', '2026-12-15', '16:00', 'Torneo festivo con equipos locales'),

-- Oruro
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14', 'Carnaval Orureño Futbolistico', '2026-02-10', '14:00', 'Partido especial por el carnaval de Oruro'),

-- Complejo Capriles - Cochabamba
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10', 'Torneo Abierto de Tenis Cochabamba', '2026-11-22', '09:00', 'Torneo regional con participacion de jugadores nacionales'),

-- Canchas Multiples Equipetrol
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18', 'Torneo de Futsal Empresarial', '2026-10-05', '18:00', 'Torneo entre empresas de la zona comercial');

-- ============================================================
-- FAVORITOS
-- ============================================================

INSERT INTO public.favorites (user_id, scenario_id) VALUES

-- Admin: le gustan los estadios grandes
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12'),

-- Gestor: le gustan los coliseos y canchas multiples
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18'),

-- Asistente: variado
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20');

-- ============================================================
-- IMAGENES DE ESCENARIOS
-- Cada escenario tiene 1-3 imagenes. El storage_path sigue
-- el patron: {scenario_id}/image-{n}.jpg
-- La url apunta al bucket publico scenario-images.
-- ============================================================

INSERT INTO public.scenario_images (scenario_id, storage_path, url, is_primary, display_order) VALUES

-- Estadio Hernando Siles (3 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/image-2.jpg',
 false, 1),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/image-3.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/image-3.jpg',
 false, 2),

-- Coliseo Eduardo Leon (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02/image-2.jpg',
 false, 1),

-- Coliseo Ciudad de La Paz (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03/image-2.jpg',
 false, 1),

-- Estadio Municipal de El Alto (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04/image-1.jpg',
 true, 0),

-- Estadio Ramon Tahuichi Aguilera (3 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05/image-2.jpg',
 false, 1),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05/image-3.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05/image-3.jpg',
 false, 2),

-- Coliseo de Deportes de Santa Cruz (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06/image-2.jpg',
 false, 1),

-- Arena Magma Fest (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e07/image-2.jpg',
 false, 1),

-- Estadio Felix Capriles (3 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08/image-2.jpg',
 false, 1),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08/image-3.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e08/image-3.jpg',
 false, 2),

-- Coliseo de Deportes de Cochabamba (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e09/image-2.jpg',
 false, 1),

-- Complejo Deportivo Capriles (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e10/image-2.jpg',
 false, 1),

-- Estadio Olimpico Patria (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11/image-1.jpg',
 true, 0),

-- Estadio Victor Agustin Ugarte (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12/image-1.jpg',
 true, 0),

-- Estadio Carlos Villegras (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13/image-1.jpg',
 true, 0),

-- Estadio Jesus Bermudez (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e14/image-2.jpg',
 false, 1),

-- Estadio Melgar (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e15',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e15/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e15/image-1.jpg',
 true, 0),

-- Canchas Multiples Zona Sur (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e16/image-1.jpg',
 true, 0),

-- Canchas Multiples Urkupiña (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e17',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e17/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e17/image-1.jpg',
 true, 0),

-- Canchas Multiples Equipetrol (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e18/image-2.jpg',
 false, 1),

-- Polideportivo Villa Ignacio (1 imagen)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e19/image-1.jpg',
 true, 0),

-- Club de Tenis La Paz (2 imagenes)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20/image-1.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20/image-1.jpg',
 true, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20',
 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20/image-2.jpg',
 'scenario-images/e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e20/image-2.jpg',
 false, 1);
