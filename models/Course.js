const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues } = require('../services/sqltools');
const { isEmpty } = require('../services/utils');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(id) {
  if (id) {
    const { text, params } = whereParams({
      id: id,
    });

    const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } else {
    throw HttpError(400, 'Id is required.');
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
  const res = await db.query(`SELECT * from "course" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} courses from db with criteria: ${text}, ${JSON.stringify(params)}`
  );
  return res.rows;
}

// if successful delete, return course was deleted
async function deleteCourse(id) {
  // check that id is not nullable
  if (id) {
    const { text, params } = whereParams({
      id: id,
    });

    const res = await db.query(`DELETE FROM "course" ${text};`, params);
    if (res.rows.length > 0) {
      return true;
    }
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

const validParams = {
  prefix: true,
  suffix: true,
  title: true,
  description: true,
  credits: true,
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
  for (const param in validParams) {
    if (properties[param] === undefined) {
      throw HttpError(500, 'Missing Course Parameters');
    }
  }
  if (!isEmpty(findOne({ courseId: properties.courseId }))) {
    console.table(properties);
    throw HttpError(500, 'Course already addded');
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
  count,
};
