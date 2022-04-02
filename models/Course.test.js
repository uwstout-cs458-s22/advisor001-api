const log = require('loglevel');
const { db } = require('../services/database');
const Course = require('./Course');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../services/database.js', () => {
  return {
    db: {
      query: jest.fn(),
    },
  };
});

jest.mock('../services/environment.js', () => {
  return {
    masterAdminEmail: 'master@gmail.com',
  };
});

// a helper that creates an array structure for getCourseById
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

describe('Course Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('querying a single course by id', () => {
    test('confirm calls to query', async () => {
      const data = dataForGetCourse(1);
      const id = data[0].id;

      db.query.mockResolvedValue({ rows: data });
      await Course.findOne(id);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('should return a single Course', async () => {
      const data = dataForGetCourse(1);
      const id = data[0].id;

      db.query.mockResolvedValue({ rows: [data] });
      const course = await Course.findOne(id);

      for (const key in Object.keys(data)) {
        expect(course).toHaveProperty(key, data[key]);
      }
    });

    test('should return empty for unfound course', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const course = await Course.findOne(123);

      expect(Object.keys(course)).toHaveLength(0);
    });

    test('should throw error for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Course.findOne(123)).rejects.toThrowError('a testing database error');
    });

    test('should throw error if no parameters', async () => {
      await expect(Course.findOne()).rejects.toThrowError('Id is required.');
    });
  });

  describe('deleting a course', () => {
    test('Course.deleteCourse with expected data', async () => {
      const data = dataForGetCourse(1);
      const id = data[0].id;

      db.query.mockResolvedValue({ rows: data });
      const deleteCourse = await Course.deleteCourse(id);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "course" WHERE "id"=$1;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
      expect(deleteCourse).toBe(true);
    });

    test('Course.deleteCourse with database error', async () => {
      const data = dataForGetCourse(1);
      const id = data[0].id;

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Course.deleteCourse(id)).rejects.toThrowError('a testing database error');

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "course" WHERE "id"=$1;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('Course.deleteCourse with no input', async () => {
      await expect(Course.deleteCourse()).rejects.toThrowError('Id is required.');
    });
  });

  describe('Count Courses', () => {
    test('One Course in the Database', async () => {
      db.query.mockResolvedValue({ rows: [{ count: 1 }] });
      const res = await Course.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "course"`);
      expect(res).toHaveProperty('count', 1);
    });
  });
});
