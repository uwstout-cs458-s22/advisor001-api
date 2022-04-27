const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Program = require('./../models/Program');
const ProgramCourse = require('./../models/ProgramCourse');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');
const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  // Get multiple programs
  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const programs = await Program.findAll(null, req.query.limit, req.query.offset);
      log.info(`${req.method} ${req.originalUrl} success: returning ${programs.length} program(s)`);
      return res.send(programs);
    } catch (error) {
      next(error);
    }
  });

  // Get single program
  router.get('/:programId', authorizeSession, async (req, res, next) => {
    try {
      const programId = req.params.programId;
      const program = await Program.findOne({ id: programId });
      // catch if the program does not exist
      if (isEmpty(program)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning program ${programId}`);
      return res.send(program);
      // catch general errors
    } catch (error) {
      next(error);
    }
  });

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
