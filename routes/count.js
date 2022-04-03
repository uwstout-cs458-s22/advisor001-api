const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const { authorizeSession } = require('./../services/auth');
const counters = {
  user: require('./../models/User').count,
  course: require('./../models/Course').count,
  term: require('./../models/Term').count,
};

module.exports = () => {
  const router = express.Router();

  router.get('/users', authorizeSession, async (req, res, next) => {
    try {
      const row = await counters.user();
      if (isEmpty(row)) {
        throw HttpError.InternalServerError(`Cannot Count ${req.originalUrl}`);
      }
      log.info(`${req.method} ${req.originalUrl} success: returning count of ${row.count} user(s)`);
      res.send(row);
    } catch (err) {
      next(err);
    }
  });

  router.get('/courses', authorizeSession, async (req, res, next) => {
    try {
      const row = await counters.course();
      if (isEmpty(row)) {
        throw HttpError.InternalServerError(`Cannot Count ${req.originalUrl}`);
      }
      log.info(
        `${req.method} ${req.originalUrl} success: returning count of ${row.count} course(s)`
      );
      res.send(row);
    } catch (err) {
      next(err);
    }
  });

  router.get('/terms', authorizeSession, async (req, res, next) => {
    try {
      const row = await counters.term();
      if (isEmpty(row)) {
        throw HttpError.InternalServerError(`Cannot Count ${req.originalUrl}`);
      }
      log.info(`${req.method} ${req.originalUrl} success: returning count of ${row.count} term(s)`);
      res.send(row);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
