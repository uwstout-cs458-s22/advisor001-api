const HttpError = require('http-errors');
const { db } = require('../services/database');
const { whereParams, insertValues, updateValues } = require('../services/sqltools');
// const { whereParams } = require('../services/sqltools');

async function get(id) {
  if (id) {
    const res = await db.query(`SELECT * FROM "term" WHERE id = ${id};`);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    else {
      throw HttpError(500, 'Some Error Occurred');
      return {};
    }
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

async function count() {
  const res = await db.query(`SELECT COUNT(*) FROM "term"`);

  if (res.rows.length > 0) {
    return res.rows[0];
  } else {
    throw HttpError(500, 'Some Error Occurred');
  }
}

module.exports = {
  count,
};
