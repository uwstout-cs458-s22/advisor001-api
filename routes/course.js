const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  // Get multiple courses
  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const courses = await Course.findAll(null, req.query.limit, req.query.offset);
      log.info(`${req.method} ${req.originalUrl} success: returning ${courses.length} course(s)`);
      return res.send(courses);
    } catch (error) {
      next(error);
    }
  });

  // Get single course
  router.get('/:courseId', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findOne({ id: courseId });
      // catch if the course does not exist
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning course ${courseId}`);
      return res.send(course);
      // catch general errors
    } catch (error) {
      next(error);
    }
  });

  // Create course
  router.post('/', authorizeSession, setClearanceLevel('director'), async (req, res, next) => {
    try {
      const { prefix, suffix, title, description, credits } = req.body;
      const properties = { prefix, suffix, title, description, credits };

      if (Object.values(properties).some((value) => !value)) {
        throw HttpError(400, 'Required Parameters Missing');
      }

      // Check that the course doesn't already exist
      let course = await Course.findOne(properties);

      // Create course
      if (isEmpty(course)) {
        course = await Course.addCourse(properties);
        res.status(200);
      } else {
        throw HttpError(500, 'Course Already Exists');
      }

      res.setHeader('Location', `/course/${course.id}`);

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

  router.delete('/:id?', authorizeSession, setClearanceLevel('admin'), async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id || id === '') {
        throw HttpError(400, 'Required Parameters Missing');
      }

      let course = await Course.findOne({ id: id });
      if (isEmpty(course)) {
        throw new HttpError[500]();
      }

      course = await Course.deleteCourse(id);

      res.status(200);
      res.send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
