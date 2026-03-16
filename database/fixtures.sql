INSERT INTO "User" (
  id,
  email,
  username,
  firstname,
  lastname,
  city,
  gender,
  preference,
  password,
  token
) VALUES (
  'f8dd18fe-35dc-4fc1-8b69-f7586686fc80',
  'user@matcha.com',
  'user-matcha',
  'user',
  'matcha',
  'Paris',
  'MALE',
  'FEMALE',
  '$2b$12$F5aC/GukiNJVheLdQMss4.wJQrpo.m8y.jOKia.Vf6buBks22hJu.',
  '5f737066-f767-4235-bbde-8765a7edff18'
), (
  '8d622fc8-a8cf-46d8-b705-aa095aa68dc6',
  'user2@matcha.com',
  'user2-matcha',
  'user2',
  'matcha',
  'Berlin',
  'FEMALE',
  'MALE',
  '$2b$12$F5aC/GukiNJVheLdQMss4.wJQrpo.m8y.jOKia.Vf6buBks22hJu.',
  '5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2'
);


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
  popularity,
  password,
  token
FROM (
  SELECT
    gen_random_uuid() as id,
    'user-' || item || '@matcha.com' as email,
    'user-' || item as username,
    (ARRAY['Lea', 'Thomas', 'Lucas', 'Manon'])[ceil(random() * 3.99)] AS firstname,
    (ARRAY['Martin', 'Bernard', 'Petit', 'Dubois'])[ceil(random() * 3.99)] AS lastname,
    (ARRAY['Paris', 'Marseille', 'Toulouse', 'Lyon', 'Bordeaux', 'Strasbourg', 'Montpellier', 'Nice', 'Ajaccio', 'Cayenne', 'Fort-de-France'])[ceil(random() * 10.99)] AS city,
    (SELECT ARRAY_AGG(n) FROM generate_series(18, 99) as n)[ceil(random() * 76.99)] as age,
    (ARRAY['MALE', 'FEMALE', 'DO NOT PRONONCE', 'OTHERS'])[ceil(random() * 3.99)]::gender AS gender,
    (ARRAY['MALE', 'FEMALE', 'BOTH'])[ceil(random() * 2.99)]::preference AS preference,
    random() * 100 as popularity,
    'hXgGAY2u4XNu/UpAcqHjOuyytNs.DvXf0iLE0.5R6OiFh7bMaH21q' as password, -- pass
    gen_random_uuid() as token
  FROM generate_series(1, 500) AS item
) as sub
