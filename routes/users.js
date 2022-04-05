const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const User = require('./../models/User');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const users = await User.findAll(null, req.query.limit, req.query.offset);
      log.info(`${req.method} ${req.originalUrl} success: returning ${users.length} user(s)`);
      return res.send(users);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ id: id });
      if (isEmpty(user)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning user ${id}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:userId', authorizeSession, async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const user = await User.findOne({ userId: userId });
      if (isEmpty(user)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning user ${userId}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

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
  router.put('/:userId?', authorizeSession, setClearanceLevel('admin'), async (req, res, next) => {
    try {
      // is the given id a valid format & non-empty?
      const userId = req.params.userId;
      if (!userId || userId === '') {
        throw HttpError(400, 'Required Parameters Missing');
      }
      const user = await User.findOne({ userId: userId });

      // make sure exists
      if (isEmpty(user)) {
        throw new HttpError.NotFound();
      }

      // perform the edit
      const editResult = await User.edit(userId, {
        enable: req.body.enable || user.enable,
        role: req.body.role || user.role,
      });

      // success
      log.info(`${req.method} ${req.originalUrl} success: returning edited user ${editResult}`);
      return res.send(editResult);
    } catch (error) {
      next(error);
    }
  });

  router.delete(
    '/:userId?',
    authorizeSession,
    setClearanceLevel('admin'),
    async (req, res, next) => {
      try {
        const userId = req.params.userId;
        if (!userId || userId === '') {
          throw HttpError(400, 'Required Parameters Missing');
        }

        let user = await User.findOne({ userId: userId });
        if (isEmpty(user)) {
          throw new HttpError.NotFound();
        }

        user = await User.deleteUser(userId);

        res.status(200);
        res.send();
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};
