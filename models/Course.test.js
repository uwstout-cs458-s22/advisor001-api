const { db } = require('../services/database');
const log = require('loglevel');
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
      prefix: 'CS',
      suffix: `${value}`,
      title: 'Computer Science 1',
      description: `An introduction to Computer Science`,
      credits: 3,
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

      db.query.mockResolvedValueOnce({ rows: data });
      await Course.findOne(id);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('should return a single Course', async () => {
      const data = dataForGetCourse(1);
      const id = data[0].id;

      db.query.mockResolvedValueOnce({ rows: [data] });
      const course = await Course.findOne(id);

      for (const key in Object.keys(data)) {
        expect(course).toHaveProperty(key, data[key]);
      }
    });

    test('should return empty for unfound course', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
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

  describe('querying groups of courses', () => {
    test('should make a call to Course.findAll - no criteria, no limits, no offsets', async () => {
      const data = dataForGetCourse(5);
      db.query.mockResolvedValueOnce({ rows: data });

      const courses = await Course.findAll();

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('SELECT * from "course"  LIMIT $1 OFFSET $2;');
      expect(db.query.mock.calls[0][1]).toHaveLength(2);
      expect(db.query.mock.calls[0][1][0]).toBe(100);
      expect(db.query.mock.calls[0][1][1]).toBe(0);
      expect(courses).toHaveLength(data.length);

      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(courses[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Course.findAll - with criteria, no limits, no offsets', async () => {
      const data = dataForGetCourse(5);
      db.query.mockResolvedValueOnce({ rows: data });
      const courses = await Course.findAll({ credits: 3 }, undefined);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "course" WHERE "credits"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(3);
      expect(db.query.mock.calls[0][1][1]).toBe(100);
      expect(db.query.mock.calls[0][1][2]).toBe(0);
      expect(courses).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(courses[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Course.findAll - with criteria, with limits, no offsets', async () => {
      const data = dataForGetCourse(3);
      db.query.mockResolvedValueOnce({ rows: data });
      const courses = await Course.findAll({ credits: 3 }, 5);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "course" WHERE "credits"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(3);
      expect(db.query.mock.calls[0][1][1]).toBe(5);
      expect(db.query.mock.calls[0][1][2]).toBe(0);
      expect(courses).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(courses[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Course.findAll - with criteria, with limits, with offsets', async () => {
      const data = dataForGetCourse(3, 1);
      db.query.mockResolvedValueOnce({ rows: data });
      const courses = await Course.findAll({ credits: 3 }, 5, 1);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "course" WHERE "credits"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(3);
      expect(db.query.mock.calls[0][1][1]).toBe(5);
      expect(db.query.mock.calls[0][1][2]).toBe(1);
      expect(courses).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(courses[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Course.findAll()).rejects.toThrowError('a testing database error');
    });
  });

  describe('deleting a course', () => {
    test('Course.deleteCourse with expected data', async () => {
      const data = dataForGetCourse(1);
      const id = data[0].id;

      db.query.mockResolvedValueOnce({ rows: data });
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

  describe('Adding Course', () => {
    beforeEach(() => {
      db.query.mockReset();
      db.query.mockResolvedValue(null);
    });

    // helper that runs the add
    function doAdd(newCourse, duplicate = false) {
      db.query.mockResolvedValueOnce(duplicate ? { rows: [newCourse] } : { rows: [] });
      db.query.mockResolvedValueOnce({ rows: [newCourse] });
      return Course.addCourse(newCourse);
    }

    test('Adding single course success', async () => {
      const course = dataForGetCourse(1)[0];
      const result = await doAdd(course);

      // should return property
      for (const key of Object.keys(course)) {
        expect(result).toHaveProperty(key, course[key]);
      }
    });

    test('Inputting invalid value', async () => {
      const course = dataForGetCourse(1)[0];
      course.description = { test: "object that's not string" };

      await expect(doAdd(course)).rejects.toThrowError('Incompatible Course Parameter Types');
    });

    test('Inputting null parameters', async () => {
      await expect(doAdd(null)).rejects.toThrowError('Missing Course Parameters');
      expect(db.query).not.toBeCalled();
    });

    test('Inputting empty object', async () => {
      await expect(doAdd({})).rejects.toThrowError('Missing Course Parameters');
      expect(db.query).not.toBeCalled();
    });

    test('Inputting duplicate course', async () => {
      const course = dataForGetCourse(1)[0];
      await doAdd(course);
      await expect(doAdd(course, true)).rejects.toThrowError('Course already added');
    });
  });

  describe('Count Courses', () => {
    test('One Course in the Database', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
      const res = await Course.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "course"`);
      expect(res).toHaveProperty('count', 1);
    });
  });
});
