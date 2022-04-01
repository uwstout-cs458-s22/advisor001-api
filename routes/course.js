const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  // Get multiple courses
  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const courses = await Course.findAll(null, req.query.limit, req.query.offset);
      log.info(`${req.method} ${req.originalUrl} success: returning ${courses.length} user(s)`);
      return res.send(courses);
    } catch (error) {
      next(error);
    }
  });

  // Get single course
  router.get('/:courseId', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findOne(courseId);
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
