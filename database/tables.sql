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
  id              UUID            NOT NULL DEFAULT gen_random_uuid(),
  email           VARCHAR(50)     NOT NULL UNIQUE,
  firstname       VARCHAR(50)     NOT NULL,
  lastname        VARCHAR(50)     NOT NULL,
  username        VARCHAR(50)     NOT NULL UNIQUE,
  gender          GENDER          DEFAULT NULL,
  preference      PREFERENCE      DEFAULT NULL,
  bio             TEXT            DEFAULT NULL,
  token           VARCHAR(36)     UNIQUE,
  password        VARCHAR(150)    NOT NULL,
  created_at      timestamp       DEFAULT NOW()
);
