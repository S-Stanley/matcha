CREATE TYPE GENDER as ENUM (
  'MALE',
  'FEMALE',
  'OTHERS',
  'DO NOT PRONONCE'
);

CREATE TYPE PREFERENCE as ENUM (
  'MALE',
  'FEMALE',
  'BOTH'
);

CREATE TABLE "User" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email           VARCHAR(50)     NOT NULL UNIQUE,
  firstname       VARCHAR(50)     NOT NULL,
  lastname        VARCHAR(50)     NOT NULL,
  username        VARCHAR(50)     NOT NULL UNIQUE,
  gender          GENDER          DEFAULT NULL,
  preference      PREFERENCE      DEFAULT NULL,
  bio             TEXT            DEFAULT NULL,
  token           VARCHAR(36)     UNIQUE,
  password        VARCHAR(150)    NOT NULL,
  confirm_code    VARCHAR(4)      DEFAULT FLOOR(1 + (RANDOM() * 10000))::TEXT,
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "NewPasswordRequest" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  password        VARCHAR(150)    NOT NULL,
  confirm_code    VARCHAR(4)      DEFAULT FLOOR(1 + (RANDOM() * 10000))::TEXT,
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "View" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  profile_user_id UUID            NOT NULL references "User"(id),
  viewer_user_id  UUID            NOT NULL references "User"(id)
);

CREATE TABLE "Like" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  liked_by        UUID            NOT NULL references "User"(id),
  liked_user      UUID            NOT NULL references "User"(id),
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Match" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "MatchMember" (
  id              UUID            NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  match_id        UUID            NOT NULL references "Match"(id),
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Messages" (
  id              UUID            NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  match_id        UUID            NOT NULL references "Match"(id),
  content         TEXT            NOT NULL,
  created_at      timestamp       DEFAULT NOW()
);
