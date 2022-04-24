const express = require('express');
const Program = require('./../models/Program');
const ProgramCourse = require('./../models/ProgramCourse');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  // Get multiple programs
  router.get('/', authorizeSession, schematools.readMany('program', Program.findAll));

  // Get single program
  router.get('/:id(\\d+)?', authorizeSession, schematools.readOne('program', Program.findOne));

  // Crate program
  router.post(
    '/',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.create('program', Program.addProgram)
  );

  // Edit program
  router.put(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.update('program', Program.edit)
  );

  // Delete program
  router.delete(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.remove('program', Program.deleteProgram)
  );

  // Insert or update courses in program
  router.put(
    '/:program(\\d+)/course/:course(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.insertOrUpdate('program_course', ProgramCourse.addOrUpdateCourse)
  );

  // Find many courses in the program
  router.get(
    '/:program(\\d+)/course/',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.readManyJoined('program_course', ProgramCourse.findAllCourses)
  );

  // Find one course in program
  router.get(
    '/:program(\\d+)/course/:course(\\d+)',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.readOneJoined('program_course', ProgramCourse.findOneCourse)
  );

  // Delete course from program
  router.delete(
    '/:program(\\d+)/course/:course(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.removeWithCriteria('program_course', ProgramCourse.deleteCourse)
  );

  return router;
};
