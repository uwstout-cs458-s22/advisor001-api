const { isEmpty } = require('../services/utils');
const { whereParams } = require('../services/sqltools');
const { db } = require('../services/database');
const HttpError = require('http-errors');
const join = require('../services/joiner');

const joinStr = join('program', 'program_course', 'course');

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

module.exports = {
  findOne,
  findAll,
};
