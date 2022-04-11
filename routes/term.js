const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Term = require('./../models/Term');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  // Get multiple terms
  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const terms = await Term.findAll(null, req.query.limit, req.query.offset);
      log.info(`${req.method} ${req.originalUrl} success: returning ${terms.length} term(s)`);
      return res.send(terms);
    } catch (error) {
      next(error);
    }
  });

  // Get single term
  router.get('/:termId', authorizeSession, async (req, res, next) => {
    try {
      const termId = req.params.termId;
      const term = await Term.findOne({ id: termId });
      // catch if the term does not exist
      if (isEmpty(term)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning term ${termId}`);
      return res.send(term);
      // catch general errors
    } catch (error) {
      next(error);
    }
  });

  // Create term
  router.post('/', authorizeSession, async (req, res, next) => {
    try {
      const { title, startyear, semester } = req.body;
      const properties = { title, startyear, semester };
      if (properties.title && properties.startyear && properties.semester) {
        const term = await Term.addTerm(properties);
        return res.send(term);
      } else {
        throw HttpError(400, 'Required Parameters Missing');
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
