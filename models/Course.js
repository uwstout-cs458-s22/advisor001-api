const HttpError = require('http-errors');
const { db } = require('../services/database');
const { whereParams } = require('../services/sqltools');

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

module.exports = {
  findOne,
};
