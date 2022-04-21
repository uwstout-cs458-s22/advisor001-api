const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Program = require('./../models/Program');
const { authorizeSession } = require('./../services/auth');

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
  
    return router;
  };
  