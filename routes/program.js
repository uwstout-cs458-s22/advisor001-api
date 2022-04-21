const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Program = require('./../models/Program');
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

  return router;
};
