const HttpError = require('http-errors');
const log = require('loglevel');
const { authenticateStytchSession } = require('./stytchwrapper');
const { isString } = require('./utils');
const { debugMode } = require('./environment');

async function authorizeSession(req, res, next) {
  if (debugMode) {
    next();
  } else {
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
}

const { hasMinimumPermission, findOne } = require('../models/User.js');
const { isEmpty } = require('./../services/utils');

function setClearanceLevel(level) {
  if (debugMode) {
    return async (req, res, next) => next();
  } else {
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
}

module.exports = {
  authorizeSession,
  setClearanceLevel,
};
