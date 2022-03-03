const log = require('loglevel');
module.exports.db = {};

function initialize() {
  const { Pool } = require('pg');
  const { databaseUrl } = require('./environment');
  const parse = require('pg-connection-string').parse;
  const config = parse(databaseUrl);
  module.exports.db = new Pool(config);

  module.exports.db.query(
    `CREATE TABLE IF NOT EXISTS "user"  (
        email text,
        enable boolean,
        id serial,
        role text CHECK (role IN ('user', 'director', 'admin')),
        "userId" text,
        PRIMARY KEY (id)
      );
      CREATE INDEX IF NOT EXISTS "IDX_user_userId" ON "user" ("userId");
      CREATE TABLE IF NOT EXISTS "course" (
      department text,
      number serial,
      id serial,
      credits serial,
      PRIMARY KEY (id)
      );
      CREATE TABLE IF NOT EXISTS "term" (
      name text,
      id serial
      PRIMARY KEY (id)
      );
      CREATE TABLE IF NOT EXISTS "section" (
      course serial, //references course.id
      term serial, //references term.id
      instructor text,
      id serial,
      asynchronous boolean,
      regdays text CHECK (regdays IN ('Monday','Tuesday','Wednesday','Thursday','Friday)), //The days when the class regularly meets
      start serial, //When the class regularly starts in military time, or 0 if it does not meet that day.
      end serial,
      altdays text CHECK (altdays IN ('Monday','Tuesday','Wednesday','Thursday','Friday)), //The days when the class has a different meeting time
      altstart serial,
      altend serial,
      PRIMARY KEY (id)
      );`,
    (err, res) => {
      if (err) {
        throw err;
      }
      log.info('Server successfully connected to database and setup schema.');
    }
  );

  log.info(`database has ${module.exports.db.totalCount} clients existing within the pool`);
}

module.exports.initialize = initialize;
