CREATE TABLE "User" (
  id              UUID            NOT NULL DEFAULT gen_random_uuid(),
  email           VARCHAR(50)     NOT NULL,
  firstname       VARCHAR(50)     NOT NULL,
  lastname        VARCHAR(50)     NOT NULL,
  username        VARCHAR(50)     NOT NULL,
  password        VARCHAR(50)     NOT NULL,
  created_at      timestamp       DEFAULT NOW()
);
