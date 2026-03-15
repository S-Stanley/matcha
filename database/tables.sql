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
  gender          GENDER          DEFAULT 'DO NOT PRONONCE',
  preference      PREFERENCE      DEFAULT 'BOTH',
  bio             TEXT            DEFAULT NULL,
  token           VARCHAR(36)     UNIQUE,
  password        VARCHAR(150)    NOT NULL,
  confirm_code    VARCHAR(4)      DEFAULT FLOOR(1 + (RANDOM() * 10000))::TEXT,
  popularity      INTEGER         DEFAULT 0,
  city            TEXT            DEFAULT NULL,
  age             INTEGER         DEFAULT NULL,
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Picture" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  url             TEXT            NOT NULL,
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Login" ( 
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Report" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  from_user_id    UUID            NOT NULL references "User"(id),
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Block" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  from_user_id    UUID            NOT NULL references "User"(id),
  created_at      timestamp       DEFAULT NOW()
);

CREATE TABLE "Tags" (
  id              UUID            NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL references "User"(id),
  tag             TEXT            NOT NULL,
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

CREATE TYPE NOTIFICATIONS_STATUS as ENUM (
  'READ',
  'UNREAD'
);

CREATE TYPE NOTIFICATION_TYPE as ENUM (
  'NEW_LIKE',
  'NEW_VIEW',
  'NEW_MSG',
  'NEW_MATCH',
  'NEW_UNLIKE'
);

CREATE TABLE "Notifications" (
  id              UUID                  NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID                  NOT NULL references "User"(id),
  status          NOTIFICATIONS_STATUS  NOT NULL DEFAULT 'UNREAD',
  type            NOTIFICATION_TYPE     NOT NULL,
  from_user_id    UUID                  NOT NULL references "User"(id),
  created_at      timestamp             DEFAULT NOW()
);
