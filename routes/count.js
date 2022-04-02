const express = require('express');
const log = require('loglevel');
const { authorizeSession } = require('./../services/auth');

// list of counter functions
const counters = {
  users: require('./../models/User').count,
  courses: require('./../models/Course').count,
};

module.exports = () => {
  const router = express.Router();

  // generate all counter routes
  for (const counter of Object.keys(counters)) {
    router.get(`/${counter}`, authorizeSession, async (req, res, next) => {
      try {
        const row = await counters[counter]();
        log.info(
          `${req.method} ${req.originalUrl} success: returning count of ${row.count} ${counter}`
        );
        res.send(row);
      } catch (err) {
        next(err);
      }
    });
  }

  return router;
};
