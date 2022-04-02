const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  router.get('/:courseId', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findOne({ id: courseId });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning course ${courseId}`);
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
