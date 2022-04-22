const express = require('express');
const Course = require('./../models/Course');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  // Get multiple courses
  router.get('/', authorizeSession, schematools.readMany('course', Course.findAll));

  // Get single course
  router.get('/:id(\\d+)?', authorizeSession, schematools.readOne('course', Course.findOne));

  // Create course
  router.post(
    '/',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.create('course', Course.addCourse)
  );

  router.put(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.update('course', Course.edit)
  );

  router.delete(
    '/:id?',
    authorizeSession,
    setClearanceLevel('admin'),
    schematools.remove('course', Course.deleteCourse)
  );

  return router;
};
