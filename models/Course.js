const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues, updateValues } = require('../services/sqltools');
const { isEmpty, isObject, isString, isNumber } = require('../services/utils');

/**
 * @param  {} criteria
 *
 * @returns {Course}
 *
 * if found return { ... }
 * if not found return {}
 * if db error, db.query will throw a rejected promise
 */
async function findOne(criteria) {
  if (!criteria || isEmpty(criteria)) {
    throw HttpError.BadRequest('Id is required.');
  }
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  return {};
}

/**
 * @param  {} criteria
 * @param  {} limit=100
 * @param  {} offset=0
 *
 * @returns {Array}
 *
 * if found return [ {}, {} ... ]
 * if not found return []
 * if db error, db.query will throw a rejected promise
 */
async function findAll(criteria, limit = 100, offset = 0) {
  const { text, params } = whereParams(criteria);
  const n = params.length;
  const p = params.concat([limit, offset]);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} courses from db with criteria: ${text}, ${JSON.stringify(params)}`
  );
  return res.rows;
}

/**
 * @param  {} id
 *
 * @returns {Boolean}
 *
 * if successful delete, return course was deleted
 */
async function deleteCourse(id) {
  // check that id is not nullable
  if (id) {
    const { text, params } = whereParams({ id });

    const res = await db.query(`DELETE FROM "course" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      return true;
    }
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

const validParams = {
  prefix: isString,
  suffix: isString,
  title: isString,
  description: isString,
  credits: isNumber,
};

/**
 * Adds course to database
 *
 * @param  {object} properties contains all required properties
 *
 * @returns {object} course object if successfully returned
 *
 * if any paramters are null, throw a 500 error 'Missing Course Paramters'
 * if adding duplicate throws 500 error 'Course already added;'
 */
async function addCourse(properties) {
  if (!properties) {
    throw HttpError(400, 'Missing Course Parameters');
  }
  for (const param in validParams) {
    if (properties?.[param] === undefined) {
      throw HttpError(400, 'Missing Course Parameters');
    }
    if (!validParams[param](properties?.[param])) {
      throw HttpError(400, 'Incompatible Course Parameter Types');
    }
  }

  const { text, params } = insertValues(properties);

  const res = await db.query(`INSERT INTO "course" ${text} RETURNING *;`, params);

  // did it work?
  if (res.rows.length > 0) {
    log.debug(
      `Successfully inserted ${properties.prefix} ${
        properties.suffix
      } into db with data: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows[0];
  }
  throw HttpError(500, 'Unexpected DB Condition, insert sucessful with no returned record');
}

/**
 * Edits the course in the database
 *
 * @param  {} id
 * @param  {} newValues
 *
 * @returns {Course}
 *
 */
async function edit(id, newValues) {
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

    const res = await db.query(`UPDATE "course" ${text} RETURNING *;`, params);

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

/**
 * Returns amount of courses in database
 *
 * @returns {Integer}
 */
async function count() {
  const res = await db.query(`SELECT COUNT(*) FROM "course"`);

  if (res.rows.length > 0) {
    return res.rows[0];
  } else {
    throw HttpError(500, 'Some Error Occurred');
  }
}

module.exports = {
  findOne,
  findAll,
  addCourse,
  deleteCourse,
  edit,
  count,
};
