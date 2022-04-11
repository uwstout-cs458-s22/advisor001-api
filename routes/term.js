const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty, extractKeys } = require('./../services/utils');
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

  // prettier-ignore
  router.put('/:id(\\d+)?', authorizeSession, setClearanceLevel('director'), async (req, res, next) => {
      try {
        // i'm tired
        const { id } = req.params;
        if (!id || id === '') {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        const newValues = extractKeys(req.body, ...Term.properties);
        // only find one if no editable fields
        if( isEmpty(newValues) ) {
          const term = await Term.findOne({ id });
          if (isEmpty(term)) {
            throw HttpError.NotFound();
          }
          res.status(200).send(term);
        }
        else {
          // try edit (might 404)
          const term = await Term.edit(id, newValues);
          if (isEmpty(term)) {
            throw HttpError.NotFound();
          }
          // no errors thrown
          res.status(200).send(term);
        }
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};
