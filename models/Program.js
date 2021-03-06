const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues, updateValues } = require('../services/sqltools');
const { isEmpty, isString, isObject } = require('../services/utils');
const validParams = {
  title: isString,
  description: isString,
};

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

// if created, return program
async function addProgram(properties) {
  if (!properties) {
    throw HttpError(400, 'Missing Program Parameters');
  }
  for (const param in validParams) {
    if (properties?.[param] === undefined) {
      throw HttpError(400, 'Missing Program Parameters');
    }
    if (!validParams[param](properties?.[param])) {
      throw HttpError(400, 'Incompatible Program Parameter Types');
    }
  }

  const { text, params } = insertValues(properties);

  const res = await db.query(`INSERT INTO "program" ${text} RETURNING *;`, params);

  // did it work?
  if (res.rows.length > 0) {
    log.debug(
      `Successfully inserted ${properties.title} 
      into db with data: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows[0];
  }
  throw HttpError(500, 'Unexpected DB Condition, insert sucessful with no returned record');
}

/**
 * @param  {} id
 *
 * @returns {Boolean}
 *
 * if found delete Program
 * if not found return a 404
 *
 */
async function deleteProgram(id) {
  // id is required
  if (id) {
    const { text, params } = whereParams({ id });

    const res = await db.query(`DELETE FROM "program" ${text};`, params);
    if (res.rows.length > 0) {
      return true;
    }
  } else {
    throw HttpError(400, 'ProgramId is required.');
  }
}

/**
 * Edits the program in the database
 *
 * @param  {} id
 * @param  {} newValues
 *
 * @returns {Course}
 *
 */
async function editProgram(id, newValues) {
  if (id && newValues && isObject(newValues)) {
    // to be set
    const setValues = {};
    // validate newValues
    for (const param in newValues) {
      if (validParams[param]) {
        setValues[param] = newValues[param];
      }
    }
    // now update values
    const { text, params } = updateValues({ id }, setValues);

    const res = await db.query(`UPDATE "program" ${text} RETURNING *;`, params);

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

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
  addProgram,
  deleteProgram,
  editProgram,
  count,
};
