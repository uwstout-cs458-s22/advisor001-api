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
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
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
    const { text, params } = whereParams({ id });

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
  deleteCourse,
  edit,
  count,
};
