const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();

const User = require('../models/User');
const Course = require('../models/Course');
const Term = require('.././models/Term');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/User', () => {
  return {
    count: jest.fn(),
  };
});

jest.mock('../models/Course', () => {
  return {
    count: jest.fn(),
  };
});

jest.mock('../models/Term', () => {
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

describe('GET /count (users)', () => {
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
      await callGetOnCountRoute(row, 'users');
      expect(row).toHaveLength(1);
      expect(row[0]).toHaveProperty('count', 1);
    });
    test('if there is zero users in the table', async () => {
      const row = [{ count: 0 }];
      await callGetOnCountRoute(row, 'users');
      expect(row).toHaveLength(1);
      expect(row[0]).toHaveProperty('count', 0);
    });
    test('if the table does not exist', async () => {
      const row = [{ count: 1 }];
      const response = await callGetOnCountRoute(row, 'foo');
      expect(response.statusCode).toBe(404);
    });
  });
});

describe('GET /count (courses)', () => {
  beforeEach(() => {
    Course.count.mockReset();
    Course.count.mockResolvedValue(null);
  });
  async function callGetOnCountRoute(row, tableName) {
    Course.count.mockResolvedValueOnce(row);
    const response = await request(app).get(`/count/${tableName}`);
    return response;
  }
  describe('course count', () => {
    test('if there is one course in the table', async () => {
      const row = [{ count: 1 }];
      await callGetOnCountRoute(row, 'courses');
      expect(row).toHaveLength(1);
      expect(row[0]).toHaveProperty('count', 1);
    });
    test('if there is zero courses in the table', async () => {
      const row = [{ count: 0 }];
      await callGetOnCountRoute(row, 'courses');
      expect(row).toHaveLength(1);
      expect(row[0]).toHaveProperty('count', 0);
    });
    test('if the table does not exist', async () => {
      const row = [{ count: 1 }];
      const response = await callGetOnCountRoute(row, 'foo');
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /count (terms)', () => {
    beforeEach(() => {
      Term.count.mockReset();
      Term.count.mockResolvedValue(null);
    });
    async function callGetOnCountRoute(row, tableName) {
      Course.count.mockResolvedValueOnce(row);
      const response = await request(app).get(`/count/${tableName}`);
      return response;
    }
    describe('course count', () => {
      test('if there is one term in the table', async () => {
        const row = [{ count: 1 }];
        await callGetOnCountRoute(row, 'terms');
        expect(row).toHaveLength(1);
        expect(row[0]).toHaveProperty('count', 1);
      });
      test('if there is zero terms in the table', async () => {
        const row = [{ count: 0 }];
        await callGetOnCountRoute(row, 'terms');
        expect(row).toHaveLength(1);
        expect(row[0]).toHaveProperty('count', 0);
      });
      test('if the table does not exist', async () => {
        const row = [{ count: 1 }];
        const response = await callGetOnCountRoute(row, 'foo');
        expect(response.statusCode).toBe(404);
      });
    });
  });
});
