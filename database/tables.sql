CREATE TABLE "User" (
  id              UUID            NOT NULL DEFAULT gen_random_uuid(),
  email           VARCHAR(50)     NOT NULL UNIQUE,
  firstname       VARCHAR(50)     NOT NULL,
  lastname        VARCHAR(50)     NOT NULL,
  username        VARCHAR(50)     NOT NULL UNIQUE,
  token           VARCHAR(36)     UNIQUE,
  password        VARCHAR(150)    NOT NULL,
  created_at      timestamp       DEFAULT NOW()
);
