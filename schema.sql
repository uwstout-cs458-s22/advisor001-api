CREATE TABLE IF NOT EXISTS "user"  (
    email       text,
    enable      boolean,
    id          serial,
    role        text CHECK (role IN ('user', 'director', 'admin')),
    "userId"    text,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_user_userId" ON "user" ("userId");

-- course
CREATE TABLE IF NOT EXISTS "course"  (
    id          serial,
    prefix      text NOT NULL,
    suffix      text NOT NULL,
    title       text NOT NULL,
    description text,
    credits     integer CHECK (credits > 0) NOT NULL,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_course_id" ON "course" ("id");
-- AVOID DUPLICATES
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_courseId" ON "course" ("prefix", "suffix");

-- term
CREATE TABLE IF NOT EXISTS "term"  (
    id          serial,
    title       text NOT NULL,
    startyear   integer CHECK (startyear > 0) NOT NULL,
    semester    smallint CHECK (semester >= 0 and semester < 4) NOT NULL,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_term_id" ON "term" ("id");

-- program
CREATE TABLE IF NOT EXISTS "program"  (
    id          serial,
    title       text NOT NULL,
    description text NOT NULL,
    PRIMARY KEY (id)
);

-- student
CREATE TABLE IF NOT EXISTS "student"  (
    id          serial,
    displayname text NOT NULL,
    account     integer,
    program     integer,
    FOREIGN KEY (account) REFERENCES "user",
    FOREIGN KEY (program) REFERENCES "program",
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "IDX_student_id" ON "student" ("id");

-- requirement
CREATE TABLE IF NOT EXISTS "requirement"  (
    id          serial,
    shortname   text NOT NULL,
    longname    text NOT NULL,
    exclusive   boolean NOT NULL,
    credits     integer CHECK (credits > 0) NOT NULL,
    PRIMARY KEY (id)
);

-- course_prerequisite
CREATE TABLE IF NOT EXISTS "course_prerequisite"  (
    id          serial,
    course      integer NOT NULL,
    requires    integer NOT NULL,
    FOREIGN KEY (course) REFERENCES "course",
    FOREIGN KEY (requires) REFERENCES "course",
    PRIMARY KEY (id)
);
-- AVOID DUPLICATES
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_prerequisite" ON "course_prerequisite" ("course", "requires");

-- course_requirement
CREATE TABLE IF NOT EXISTS "course_requirement"  (
    id          serial,
    course      integer NOT NULL,
    fulfills    integer NOT NULL,
    FOREIGN KEY (course) REFERENCES "course",
    FOREIGN KEY (fulfills) REFERENCES "requirement",
    PRIMARY KEY (id)
);
-- AVOID DUPLICATES
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_requirement" ON "course_requirement" ("course", "fulfills");

-- program_course
CREATE TABLE IF NOT EXISTS "program_course"  (
    id          serial,
    program     integer NOT NULL,
    requires    integer NOT NULL,
    FOREIGN KEY (program) REFERENCES "program",
    FOREIGN KEY (requires) REFERENCES "course",
    PRIMARY KEY (id)
);
-- AVOID DUPLICATES
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_program_course" ON "program_course" ("program", "requires");

-- student_course
CREATE TABLE IF NOT EXISTS "student_course"  (
    id          serial,
    student     integer NOT NULL,
    course      integer NOT NULL,
    term        integer NOT NULL,
    taken       boolean NOT NULL,
    FOREIGN KEY (student) REFERENCES "student",
    FOREIGN KEY (course) REFERENCES "course",
    FOREIGN KEY (term) REFERENCES "term",
    PRIMARY KEY (id)
);
-- AVOID DUPLICATES
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_student_course" ON "student_course" ("student", "course", "term");
