const factory = require('./factory');
const HttpError = require('http-errors');
const { whereParams } = require('../services/sqltools');
const { db } = require('../services/database');
const log = require('loglevel');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
const findOne = factory.findOne('program');

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

// edit programs
const edit = factory.update('program');

// delete program
const deleteProgram = factory.remove('program');

// create program
const addProgram = factory.create('program');
/**
 * Counts programs in the database
 *
 * @returns {object} number of rows in query response
 *
 * if any paramters are null, throw a 500 error 'Some Error Occured'
 */
async function count() {
  const res = await db.query(`SELECT COUNT(*) FROM "program"`);

  if (res.rows.length > 0) {
    return res.rows[0];
  } else {
    throw HttpError(500, 'Some Error Occurred');
  }
}

module.exports = {
  findOne,
  findAll,
  count,
  edit,
  deleteProgram,
  addProgram,
};
