const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Program = require('./../models/Program');
const ProgramCourse = require('./../models/ProgramCourse');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

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

  // Get one program course
  router.get('/:program(\\d+)/course/:requires(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const programCourse = await ProgramCourse.findOne(req.params);
      if (isEmpty(programCourse)) {
        throw HttpError.NotFound();
      }
      log.info(
        `${req.method} ${req.originalUrl} success: returning one program-course ${JSON.stringify(
          req.params
        )}`
      );
      return res.send(programCourse);
    } catch (error) {
      next(error);
    }
  });
  router.put('/:id?', authorizeSession, setClearanceLevel('director'), async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id || id === '') {
        throw HttpError(400, 'Required Parameters Missing');
      }

      const program = await Program.findOne({ id });

      if (isEmpty(program)) {
        throw new HttpError.NotFound();
      }

      const editResult = await Program.edit(id, {
        title: req.body.title || program.title,
        description: req.body.description || program.description,
      });
      log.info(`${req.method} ${req.originalUrl} success: returning edited course ${editResult}`);
      return res.send(editResult);
    } catch (error) {
      next(error);
    }
  });

  // Get all program course
  router.get('/:program(\\d+)/course/', authorizeSession, async (req, res, next) => {
    try {
      const programCourseList = await ProgramCourse.findAll(req.params);
      log.info(
        `${req.method} ${req.originalUrl} success: returning all program-courses ${JSON.stringify(
          req.params
        )}`
      );
      return res.send(programCourseList);
    } catch (error) {
      next(error);
    }
  });
  // Create program
  router.post('/', authorizeSession, setClearanceLevel('director'), async (req, res, next) => {
    try {
      const { title, description } = req.body;
      const properties = { title, description };

      if (Object.values(properties).some((value) => !value)) {
        throw HttpError(400, 'Required Parameters Missing');
      }

      // Check that the program doesn't already exist
      let program = await Program.findOne(properties);

      // Create program
      if (isEmpty(program)) {
        program = await Program.addProgram(properties);
        res.status(200);
      } else {
        throw HttpError(500, 'Course Already Exists');
      }

      res.setHeader('Location', `/course/${program.id}`);

      return res.send(program);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
