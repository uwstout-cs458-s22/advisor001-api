CREATE TABLE IF NOT EXISTS "user"  (
    email text,
    enable boolean,
    id serial,
    role text CHECK (role IN ('user', 'director', 'admin')),
    "userId" text,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_user_userId" ON "user" ("userId");
