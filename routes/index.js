const bodyParser = require('body-parser');
const express = require('express');
const log = require('loglevel');

module.exports = () => {
  const router = express.Router();
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
  const courseRoutes = require('./course')();
  const usersRoutes = require('./users')();
  const countRoutes = require('./count')();
  const termRoutes = require('./term')();
  const programRoutes = require('./program')();
  router.use('/users', usersRoutes);
  router.use('/course', courseRoutes);
  router.use('/count', countRoutes);
  router.use('/term', termRoutes);
  router.use('/program', programRoutes);
  router.get('/health', (req, res) => {
    const uptime = process.uptime();
    const data = {
      uptime: uptime,
      message: 'Ok',
      date: new Date(),
    };
    log.info(`${req.method} ${req.originalUrl} success: Online for ${uptime} seconds`);
    res.status(200).send(data);
  });
  return router;
};
