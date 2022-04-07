const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Term = require('./../models/Term');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

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

  // delete a single term
  router.delete(
    '/:termId?',
    authorizeSession,
    setClearanceLevel('director'),
    async (req, res, next) => {
      try {
        const termId = req.params.termId;
        if (!termId || termId === '') {
          throw HttpError(400, 'Required Parameters Missing');
        }

        let term = await Term.findOne({ id: termId });
        if (isEmpty(term)) {
          throw new HttpError.NotFound();
        }

        term = await Term.deleteTerm(termId);

        res.status(200);
        res.send();
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};
