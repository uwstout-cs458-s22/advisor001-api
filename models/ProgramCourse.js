const { isEmpty } = require('../services/utils');
const { whereParams, insertValues } = require('../services/sqltools');
const { db } = require('../services/database');
const log = require('loglevel');
const HttpError = require('http-errors');
const join = require('../services/joiner');

const joinStr = join('program_course', 'program') + join('program_course', 'course');

async function findOne(criteria) {
  if (!criteria || isEmpty(criteria)) throw HttpError.BadRequest('Id is required.');
  const { text, params } = whereParams(criteria);
  const res = await db.query(
    `SELECT "course".* FROM "program_course" ${joinStr} ${text} LIMIT 1;`,
    params
  );
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  return {};
}

async function findAll(criteria, limit = 100, offset = 0) {
  if (!criteria || isEmpty(criteria)) throw HttpError.BadRequest('Program Id is required.');
  const { text, params } = whereParams(criteria);
  const n = params.length;
  const p = params.concat([limit, offset]);
  const res = await db.query(
    `SELECT "course".* FROM "program_course" ${joinStr} ${text} LIMIT $${n + 1} OFFSET $${n + 2};`,
    p
  );
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  return {};
}

async function addProgramCourse(properties) {
  if (!properties || isEmpty(properties)) {
    throw HttpError(400, 'Missing Parameters');
  }

  const { text, params } = insertValues(properties);

  const res = await db.query(`INSERT INTO "program_course" ${text} RETURNING *;`, params);

  // did it work?
  if (res.rows.length > 0) {
    log.debug(
      `Successfully inserted ${JSON.stringify(
        properties
      )} into db with data: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows[0];
  }
  throw HttpError(500, 'Unexpected DB Condition, insert sucessful with no returned record');
}

async function deleteProgramCourse(programId, courseId) {
  if (!programId || isEmpty(programId) || !courseId || isEmpty(courseId)) {
    throw HttpError(400, 'Missing Parameters');
  }

  const criteria = { program: programId, requires: courseId };
  const { text, params } = whereParams(criteria);

  const res = await db.query(`DELETE FROM "program_course" ${text};`, params);
  if (res.rows.length > 0) {
    return true;
  }
}

module.exports = {
  findOne,
  findAll,
  addProgramCourse,
  deleteProgramCourse,
};
