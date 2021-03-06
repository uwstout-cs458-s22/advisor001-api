const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues, updateValues } = require('../services/sqltools');
const env = require('../services/environment');

// permission levels
const rolePermissions = {
  admin: 99999,
  director: 100,
  user: 0,
};

/**
 * @param  {} criteria
 *
 * @returns {User}
 *
 * if found return { ... }
 * if not found return {}
 * if db error, db.query will throw a rejected promise
 *
 */
async function findOne(criteria) {
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "user" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    log.debug(`Successfully found user from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No users found in db with criteria: ${text}, ${JSON.stringify(params)}`);
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
  const res = await db.query(`SELECT * from "user" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} users from db with criteria: ${text}, ${JSON.stringify(params)}`
  );
  return res.rows;
}

/**
 * @param  {} userId
 * @param  {} email
 *
 * @returns {User}
 *
 * if successful insert return inserted record {}
 * if successful, but no row inserted, throw error
 * if db error, db.query will throw a rejected promise
 *  otherwise throw error
 */
async function create(userId, email) {
  // userId and email are required
  if (userId && email) {
    const enable = email === env.masterAdminEmail;
    const role = email === env.masterAdminEmail ? 'admin' : 'user';
    const { text, params } = insertValues({
      userId: userId,
      email: email,
      enable: enable,
      role: role,
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
async function deleteUser(userId) {
  // userId is required
  if (userId) {
    const { text, params } = whereParams({
      userId: userId,
    });

    const res = await db.query(`DELETE FROM "user" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      return true;
    }
  } else {
    throw HttpError(400, 'UserId is required.');
  }
}

/**
 * Edits the user in the database
 *
 * @param  {} id
 * @param  {} newValues
 *
 * @returns {User}
 *
 */
async function edit(userId, newValues) {
  if (userId && newValues && typeof newValues === 'object') {
    const { text, params } = updateValues(
      { userId: userId },
      { enable: newValues.enable, role: newValues.role }
    );

    const res = await db.query(`UPDATE "user" ${text} RETURNING *;`, params);

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } else {
    throw HttpError(400, 'UserId and new Status and Role are required.');
  }
}

/**
 * Returns amount of users in database
 *
 * @returns {Integer}
 */
async function count() {
  const res = await db.query(`SELECT COUNT(*) FROM "user"`);

  if (res.rows.length > 0) {
    return res.rows[0];
  } else {
    throw HttpError(500, 'Some Error Occurred');
  }
}

/**
 * Boolean function to check if user has correct permissions
 * @param  {} user
 * @param  {} role
 *
 * @return {Boolean}
 */
function hasMinimumPermission(user, role) {
  return rolePermissions[user?.role] >= rolePermissions[role];
}

module.exports = {
  findOne,
  findAll,
  create,
  deleteUser,
  edit,
  hasMinimumPermission,
  count,
};
