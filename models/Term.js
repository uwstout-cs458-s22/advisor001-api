const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues } = require('../services/sqltools');
const { isEmpty, isString, isNumber } = require('../services/utils');
const validParams = {
  title: isString,
  startyear: isNumber,
  semester: isNumber,
};

/**
 * @param  {} criteria
 *
 * @returns {Term}
 *
 * if found return { ... }
 * if not found return {}
 * if db error, db.query will throw a rejected promise
 *
 */
async function findOne(criteria) {
  if (!criteria || isEmpty(criteria)) {
    throw HttpError.BadRequest('Id is required.');
  }
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "term" ${text} LIMIT 1;`, params);
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
 * @returns {Array[Term]}
 *
 * if found return [ {}, {} ... ]
 * if not found return []
 * if db error, db.query will throw a rejected promise
 *
 */
async function findAll(criteria, limit = 100, offset = 0) {
  const { text, params } = whereParams(criteria);
  const n = params.length;
  const p = params.concat([limit, offset]);
  const res = await db.query(`SELECT * from "term" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} terms from db with criteria: ${text}, ${JSON.stringify(params)}`
  );
  return res.rows;
}

/**
 * @param  {} id
 *
 * @returns {Boolean}
 *
 * if found delete Term
 * if not found return a 404
 *
 */
async function deleteTerm(id) {
  // id is required
  if (id) {
    const { text, params } = whereParams({
      id: id,
    });

    const res = await db.query(`DELETE FROM "term" ${text};`, params);
    if (res.rows.length > 0) {
      return true;
    }
  } else {
    throw HttpError(400, 'TermId is required.');
  }
}

/**
 * Adds term to database
 *
 * @param  title the title of the term
 * @param  startYear the year the term starts
 * @param  semester the semester that the term is
 *
 * @returns {object} term object if successfully returned
 *
 * if any paramters are null, throw a 500 error
 */
async function addTerm(properties) {
  // log.warn(properties);
  if (!properties) {
    throw HttpError(400, 'Title, Start Year, and Semester are required.');
  }
  for (const param in validParams) {
    if (properties?.[param] === undefined) {
      throw HttpError(400, 'Title, Start Year, and Semester are required.');
    }
    if (!validParams[param](properties?.[param])) {
      throw HttpError(400, 'Title, Start Year, and Semester are required.');
    }
  }

  const { text, params } = insertValues(properties);

  const res = await db.query(`INSERT INTO "term" ${text} RETURNING *;`, params);

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
 * Edits the term in the database
 *
 * @param  {} id
 * @param  {} newValues
 *
 * @returns {Term}
 *
 */
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

/**
 * Returns amount of terms in database
 *
 * @returns {Integer}
 */
async function count() {
  const res = await db.query(`SELECT COUNT(*) FROM "term"`);

  if (res.rows.length > 0) {
    return res.rows[0];
  } else {
    throw HttpError(500, 'Some Error Occurred');
  }
}

module.exports = {
	findOne,
	findAll,
	deleteTerm,
	addTerm,
	count,
	edit,
	properties: Object.keys(validParams),
  };
