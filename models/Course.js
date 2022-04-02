const HttpError = require('http-errors');
const { db } = require('../services/database');
const { whereParams } = require('../services/sqltools');
const { isEmpty } = require('../services/utils');

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
  deleteCourse,
  count,
};
