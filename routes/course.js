const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

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

  router.put('/:id?', authorizeSession, setClearanceLevel('director'), async (req, res, next) => {
    try {
      // is the given id a valid format & non-empty?
      const id = req.params.id;
      if (!id || id === '') {
        throw HttpError(400, 'Required Parameters Missing');
      }
      const course = await Course.findOne({ id });

      // make sure exists
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }

      // perform the edit
      const editResult = await Course.edit(id, {
        prefix: req.body.prefix || course.prefix,
        suffix: req.body.suffix || course.suffix,
        title: req.body.title || course.title,
        description: req.body.description || course.description,
        credits: req.body.credits || course.credits,
      });

      // success
      log.info(`${req.method} ${req.originalUrl} success: returning edited course ${editResult}`);
      return res.send(editResult);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
