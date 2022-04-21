const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, updateValues } = require('../services/sqltools');
const { isEmpty, isObject } = require('../services/utils');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
  if (!criteria || isEmpty(criteria)) {
    throw HttpError.BadRequest('Id is required.');
  }
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "program" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  return {};
}

// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise
async function findAll(criteria, limit = 100, offset = 0) {
  const { text, params } = whereParams(criteria);
  const n = params.length;
  const p = params.concat([limit, offset]);
  const res = await db.query(
    `SELECT * from "program" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`,
    p
  );
  log.debug(
    `Retrieved ${res.rows.length} programs from db with criteria: ${text}, ${JSON.stringify(
      params
    )}`
  );
  return res.rows;
}

async function edit(id, newValues) {
  // TODO the routes should probably be doing the validation, not this
  if (id && newValues && isObject(newValues)) {
    const { text, params } = updateValues({ id }, newValues);
    const res = await db.query(`UPDATE "term" ${text} RETURNING *;`, params);
    // did it work?
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    // nothing was updated
    return {};
  }
  // TODO ambiguous error
  else throw HttpError.BadRequest('Id is required.');
}

module.exports = {
  findOne,
  findAll,
  edit,
};
