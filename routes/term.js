const express = require('express');
const Term = require('./../models/Term');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  // Get multiple terms
  router.get('/', authorizeSession, schematools.readMany('term', Term.findAll));

  // Get single term
  router.get('/:id(\\d+)?', authorizeSession, schematools.readOne('term', Term.findOne));

  // edit term
  router.put(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.update('term', Term.edit)
  );

  // delete term
  router.delete(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.remove('term', Term.deleteTerm)
  );

  // Create term
  router.post(
    '/',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.create('term', Term.addTerm)
  );

  return router;
};
