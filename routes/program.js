const express = require('express');
const Program = require('./../models/Program');
const { authorizeSession } = require('./../services/auth');

const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  // Get multiple programs
  router.get('/', authorizeSession, schematools.readMany('program', Program.findAll));

  // Get single program
  router.get('/:id(\\d+)?', authorizeSession, schematools.readOne('program', Program.findOne));

  return router;
};
