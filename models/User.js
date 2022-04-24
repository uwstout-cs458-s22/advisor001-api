const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { insertValues } = require('../services/sqltools');
const env = require('../services/environment');

const factory = require('./factory');

// permission levels
const rolePermissions = {
  admin: 99999,
  director: 100,
  user: 0,
};

function hasMinimumPermission(user, role) {
  return rolePermissions[user?.role] >= rolePermissions[role];
}

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
const findOne = factory.findOne('user');

// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise
const findAll = factory.findAll('user');

// return { count: integer }
const count = factory.count('user');

// if successful insert return inserted record {}
// if successful, but no row inserted, throw error
// if db error, db.query will throw a rejected promise
// otherwise throw error
async function create(userId, email) {
  // userId and email are required
  if (userId && email) {
    const enable = email === env.masterAdminEmail;
    const role = email === env.masterAdminEmail ? 'admin' : 'user';
    const { text, params } = insertValues({
      userId,
      email,
      enable,
      role,
    });
    const res = await db.query(`INSERT INTO "user" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      log.debug(
        `Successfully inserted user ${email} into db with data: ${text}, ${JSON.stringify(params)}`
      );
      return res.rows[0];
    }
    throw HttpError(500, 'Unexpected DB Condition, insert sucessful with no returned record');
  } else {
    throw HttpError(400, 'UserId and Email are required.');
  }
}

// if successful delete, return user was deleted
const deleteUser = factory.remove('user', 'userId');

// edit a user
const edit = factory.update('user', 'userId');

module.exports = {
  findOne,
  findAll,
  create,
  deleteUser,
  edit,
  hasMinimumPermission,
  count,
};
