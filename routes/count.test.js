const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();

const User = require('../models/User');
// const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/User', () => {
  return {
    count: jest.fn(),
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
  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      return next();
    }),
    setClearanceLevel: jest.fn().mockImplementation((level) => (req, res, next) => {
      return next();
    }),
  };
});

describe('GET /count', () => {
  beforeEach(() => {
    User.count.mockReset();
    User.count.mockResolvedValue(null);
  });

  async function callGetOnCountRoute(row, tableName) {
    User.count.mockResolvedValueOnce(row);
    const response = await request(app).get(`/count/${tableName}`);
    return response;
  }
  describe('user count', () => {
    test('if there is one user in the table', async () => {
      const row = [{ count: 1 }];
      await callGetOnCountRoute(row, 'user');
      expect(row).toHaveLength(1);
      expect(row[0]).toHaveProperty('count', 1);
    });
  });
});
