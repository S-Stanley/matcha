CREATE TABLE "User" (
  id              UUID            NOT NULL,
  email           VARCHAR(50)     NOT NULL,
  password        VARCHAR(50)     NOT NULL,
  created_at      timestamp       DEFAULT NOW()
);
