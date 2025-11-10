-- Criar usuário Wandinha Addams na tabela users
INSERT INTO users (
  id,
  name,
  username,
  element,
  is_professor,
  rank,
  xp,
  photo_url,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Wandinha Addams',
  'wandinha',
  'ar',
  false,
  'C',
  250,
  null,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;