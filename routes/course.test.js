const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/Course', () => {
  return {
    findOne: jest.fn(),
  };
});

jest.mock('../services/environment', () => {
  return {
    port: 3001,
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    masterAdminEmail: 'master@gmail.com',
  };
});

jest.mock('../services/auth', () => {
  const { setClearanceLevel } = jest.requireActual('../services/auth');

  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      return next();
    }),
    setClearanceLevel,
  };
});

const auth = require('../services/auth');

function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      department: 'DEP',
      number: `${value}`,
      credits: '3',
    });
  }
  return data;
}
