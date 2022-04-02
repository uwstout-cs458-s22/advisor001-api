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

// a helper that creates an array structure for getCourseById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      prefix: 'DEP',
      suffix: `${100 + i}`,
      title: 'Introduction to Whatever',
      description: 'Department consent required',
      credits: 3,
    });
  }
  return data;
}

describe('GET /course', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
  });

  // helper functions - id is a numeric value
  async function callGetOnCourseRoute(row, key = 'id') {
    const id = row[key];
    Course.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/course/${id}`);
    return response;
  }

  describe('given a row id', () => {
    test('should make a call to Course.findOne', async () => {
      const row = dataForGetCourse(1)[0];
      await callGetOnCourseRoute(row);
      expect(Course.findOne.mock.calls).toHaveLength(1);
      expect(Course.findOne.mock.calls[0]).toHaveLength(1);
      expect(Course.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containing the course data', async () => {
      const data = dataForGetCourse(10);
      for (const row of data) {
        const { body: course } = await callGetOnCourseRoute(row);

        for (const key in Object.keys(row)) {
          expect(course).toHaveProperty(key, row[key]);
        }
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetCourse(1, 100);
      const response = await callGetOnCourseRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when course exists', async () => {
      const data = dataForGetCourse(1, 100);
      const response = await callGetOnCourseRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when course does NOT exists', async () => {
      Course.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/course/100`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Course.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/course/100`);
      expect(response.statusCode).toBe(500);
    });
  });
});
