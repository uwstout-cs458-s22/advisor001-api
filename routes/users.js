const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const User = require('./../models/User');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  router.get('/', authorizeSession, schematools.readMany('user', User.findAll));

  router.get('/:id(\\d+)', authorizeSession, schematools.readOne('user', User.findOne));

  router.get('/:userId', authorizeSession, schematools.readOne('user', User.findOne, 'userId'));

  router.post('/', authorizeSession, async (req, res, next) => {
    try {
      const userId = req.body.userId;
      const email = req.body.email;
      if (!userId || !email) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      let user = await User.findOne({ userId: userId });
      if (isEmpty(user)) {
        user = await User.create(userId, email);
        res.status(201); // otherwise
      }
      res.setHeader('Location', `/users/${user.id}`);
      log.info(`${req.method} ${req.originalUrl} success: returning user ${email}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

  // edit users
  router.put(
    '/:userId?',
    authorizeSession,
    setClearanceLevel('admin'),
    schematools.update('user', User.edit, 'userId')
  );

  router.delete(
    '/:userId?',
    authorizeSession,
    setClearanceLevel('admin'),
    schematools.remove('user', User.deleteUser, 'userId')
  );

  return router;
};
