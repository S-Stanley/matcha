INSERT INTO "User" (
  id,
  email,
  username,
  firstname,
  lastname,
  age,
  city,
  gender,
  preference,
  bio,
  popularity,
  password,
  token
) VALUES (
  'f8dd18fe-35dc-4fc1-8b69-f7586686fc80',
  'user@matcha.com',
  'user-matcha',
  'user',
  'matcha',
  28,
  'Paris',
  'MALE',
  'FEMALE',
  'J aime la photo, les voyages et les cafes tranquilles.',
  92,
  '$2b$12$F5aC/GukiNJVheLdQMss4.wJQrpo.m8y.jOKia.Vf6buBks22hJu.',
  '5f737066-f767-4235-bbde-8765a7edff18'
), (
  '8d622fc8-a8cf-46d8-b705-aa095aa68dc6',
  'user2@matcha.com',
  'user2-matcha',
  'user2',
  'matcha',
  26,
  'Berlin',
  'FEMALE',
  'MALE',
  'Passionnee de cinema, musique live et sport en plein air.',
  88,
  '$2b$12$F5aC/GukiNJVheLdQMss4.wJQrpo.m8y.jOKia.Vf6buBks22hJu.',
  '5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2'
);

INSERT INTO "Tags" (user_id, tag) VALUES
  ('f8dd18fe-35dc-4fc1-8b69-f7586686fc80', 'photo'),
  ('f8dd18fe-35dc-4fc1-8b69-f7586686fc80', 'voyage'),
  ('f8dd18fe-35dc-4fc1-8b69-f7586686fc80', 'lecture'),
  ('8d622fc8-a8cf-46d8-b705-aa095aa68dc6', 'cinema'),
  ('8d622fc8-a8cf-46d8-b705-aa095aa68dc6', 'musique'),
  ('8d622fc8-a8cf-46d8-b705-aa095aa68dc6', 'sport');

INSERT INTO "User" (
  id,
  email,
  username,
  firstname,
  lastname,
  age,
  city,
  gender,
  preference,
  bio,
  popularity,
  password,
  token
)
SELECT
  id,
  email,
  username,
  firstname,
  lastname,
  age,
  city,
  gender,
  preference,
  bio,
  popularity,
  password,
  token
FROM (
  SELECT
    gen_random_uuid() AS id,
    'user-' || item || '@matcha.com' AS email,
    'user-' || item AS username,
    (ARRAY['Lea', 'Thomas', 'Lucas', 'Manon'])[ceil(random() * 3.99)] AS firstname,
    (ARRAY['Martin', 'Bernard', 'Petit', 'Dubois'])[ceil(random() * 3.99)] AS lastname,
    (ARRAY['Paris', 'Marseille', 'Toulouse', 'Lyon', 'Bordeaux', 'Strasbourg', 'Montpellier', 'Nice', 'Ajaccio', 'Cayenne', 'Fort-de-France'])[ceil(random() * 10.99)] AS city,
    (SELECT ARRAY_AGG(n) FROM generate_series(18, 99) AS n)[ceil(random() * 81.99)] AS age,
    (ARRAY['MALE', 'FEMALE', 'DO NOT PRONONCE', 'OTHERS'])[ceil(random() * 3.99)]::gender AS gender,
    (ARRAY['MALE', 'FEMALE', 'BOTH'])[ceil(random() * 2.99)]::preference AS preference,
    (ARRAY[
      'Aime sortir, discuter et decouvrir de nouveaux endroits.',
      'Fan de sport, de cuisine et de week ends improvises.',
      'Passionne de cinema et de musique, toujours partant pour une expo.',
      'Profile ouvert, curieux et sociable.'
    ])[ceil(random() * 3.99)] AS bio,
    floor(random() * 301)::int AS popularity,
    '$2b$12$F5aC/GukiNJVheLdQMss4.wJQrpo.m8y.jOKia.Vf6buBks22hJu.' AS password, -- pass
    gen_random_uuid() AS token
  FROM generate_series(1, 500) AS item
) AS sub;

INSERT INTO "Tags" (user_id, tag)
SELECT
  u.id,
  picked.tag
FROM "User" u
JOIN LATERAL (
  SELECT tag
  FROM unnest(ARRAY[
    'sport',
    'cinema',
    'musique',
    'voyage',
    'cuisine',
    'jeux',
    'lecture',
    'tech',
    'photo',
    'art',
    'nature',
    'anime'
  ]::text[]) AS tag
  ORDER BY random()
  LIMIT (2 + floor(random() * 3))::int
) AS picked ON TRUE
WHERE u.username ~ '^user-[0-9]+$';
