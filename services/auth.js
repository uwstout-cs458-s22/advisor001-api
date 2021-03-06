const HttpError = require('http-errors');
const log = require('loglevel');
const { authenticateStytchSession } = require('./stytchwrapper');
const { isString } = require('./utils');

/**
 * Preliminary function for each route that requires authentication of users
 *
 * @param  {Request} req
 * @param  {Result} res
 * @param  {next} next
 *
 * @returns Nothing, will move onto next funtion via next() function when sucessfully completed
 */
async function authorizeSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (isString(authHeader) && authHeader.startsWith('Bearer ') && authHeader.length > 7) {
    const token = authHeader.substring(7, authHeader.length);
    try {
      // capture this info
      const result = await authenticateStytchSession(token);
      log.debug(
        `${req.method} ${req.originalUrl} success: authorizeSession validated token ${token}`
      );
      // add user info to the request data
      req.stytchAuthenticationInfo = result;
      // we will use it in our route
      next();
    } catch (err) {
      next(HttpError(err.status_code, `Authorization Failed: ${err.error_message}`));
    }
  } else {
    next(HttpError(401, 'Authorization of User Failed: No Token'));
  }
}

const { hasMinimumPermission, findOne } = require('../models/User.js');
const { isEmpty } = require('./../services/utils');

/**
 * @param  {String} level Roles: Admin, Director, user
 *
 * @returns Nothing, will move onto next funtion via next() function when sucessfully completed
 */
function setClearanceLevel(level) {
  return async (req, res, next) => {
    try {
      const editorUserId = req.stytchAuthenticationInfo.session.user_id;
      const editor = await findOne({ userId: editorUserId });

      if (isEmpty(editor)) {
        next(HttpError(500, 'Your account is not found in the database!'));
      }
      if (!hasMinimumPermission(editor, level)) {
        next(HttpError(401, 'You are not allowed to do that!'));
      }
      next();
    } catch (err) {
      next(HttpError(500, 'An unknown error occurred during authorization!'));
    }
  };
}

module.exports = {
  authorizeSession,
  setClearanceLevel,
};
