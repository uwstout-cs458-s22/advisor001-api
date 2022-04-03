const HttpError = require('http-errors');
const { db } = require('../services/database');
// const { whereParams } = require('../services/sqltools');

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
