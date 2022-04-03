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
    findAll: jest.fn(),
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

function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      prefix: 'CS',
      suffix: `${value}`,
      title: 'Computer Science 1',
      credits: '3',
    });
  }
  return data;
}

describe('GET /course', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    Course.findAll.mockReset();
    Course.findAll.mockResolvedValue(null);
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
      expect(Course.findOne.mock.calls[0][0]).toBe(row.id);
    });

    test('should respond with a json object containing the course data', async () => {
      const data = dataForGetCourse(10);
      for (const row of data) {
        const { body: course } = await callGetOnCourseRoute(row);
        expect(course.id).toBe(row.id);
        expect(course.department).toBe(row.department);
        expect(course.number).toBe(row.number);
        expect(course.credits).toBe(row.credits);
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

  describe('querying a group of courses', () => {
    test('should make a call to Course.findAll', async () => {
      const data = dataForGetCourse(10);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetCourse(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course?limit=3`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBe('3');
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetCourse(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course?offset=1`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetCourse(3, 1);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/course?limit=3&offset=1`);
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toBeNull();
      expect(Course.findAll.mock.calls[0][1]).toBe('3');
      expect(Course.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should respond with a json array object containg the course data', async () => {
      const data = dataForGetCourse(5);
      Course.findAll.mockResolvedValueOnce(data);
      const { body: courses } = await request(app).get(`/course`);
      expect(courses).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(courses[i].id).toBe(data[i].id);
        expect(courses[i].prefix).toBe(data[i].prefix);
        expect(courses[i].suffix).toBe(data[i].suffix);
        expect(courses[i].title).toBe(data[i].title);
        expect(courses[i].description).toBe(data[i].description);
        expect(courses[i].credits).toBe(data[i].credits);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/course`);
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/course`);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when course data returned', async () => {
      const data = dataForGetCourse(5);
      Course.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get(`/course`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when course data returned (even no courses)', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/course`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Course.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get(`/course`);
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});
