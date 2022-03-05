const HttpError = require('http-errors');
const { db } = require('../services/database');
const { whereParams } = require('../services/sqltools');

// if successful delete, return course was deleted
async function deleteCourse(id) {
  // check that id is not nullable
  if (id) {
    const { text, params } = whereParams({
      id: id,
    });

    const res = await db.query(`DELETE FROM "course" ${text};`, params);
    if (res.rows.length > 0) {
      return 'the course was deleted';
    }
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

module.exports = {
  deleteCourse,
};
