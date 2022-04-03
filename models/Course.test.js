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

  describe('querying groups of courses', () => {
    test('should make a call to Course.findAll - no criteria, no limits, no offsets', async () => {
      const data = dataForGetCourse(5);
      db.query.mockResolvedValue({ rows: data });

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
      db.query.mockResolvedValue({ rows: data });
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
      db.query.mockResolvedValue({ rows: data });
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
      db.query.mockResolvedValue({ rows: data });
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

  describe('Adding Course', () => {
    beforeEach(() => {
      db.query.mockReset();
      db.query.mockResolvedValue(null);
    });

    test('Adding single course success', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const randomCourse = dataForTestCourse();

      const result = await Course.addCourse(
        randomCourse.courseId,
        randomCourse.department,
        randomCourse.number,
        randomCourse.id,
        randomCourse.credits
      );
      expect(result).toHaveLength(1);
    });

    test('Inputting invalid value', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const randomCourse = dataForTestCourse();

      randomCourse.department = { test: "object that's not string" };

      await expect(
        await Course.addCourse(
          randomCourse.courseId,
          randomCourse.department,
          randomCourse.number,
          randomCourse.id,
          randomCourse.credits
        )
      ).rejects.toThrowError('Incompatable Course Parameter Types');
    });

    test('Inputting null parameters', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(await Course.addCourse(null, null, null, null, null)).rejects.toThrowError(
        'Missing Course Parameters'
      );
    });

    test('Inputting duplicate course', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const randomCourse = dataForTestCourse();

      await Course.addCourse(
        randomCourse.courseId,
        randomCourse.department,
        randomCourse.number,
        randomCourse.id,
        randomCourse.credits
      );

      const secondResult = await Course.addCourse(
        randomCourse.courseId,
        randomCourse.department,
        randomCourse.number,
        randomCourse.id,
        randomCourse.credits
      );

      await expect(secondResult).rejects.toThrowError('Course already addded');
    });
  });

  describe('Count Courses', () => {
    test('One User in the Database', async () => {
      db.query.mockResolvedValue({ rows: [{ count: 1 }] });
      const res = await Course.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "course"`);
      expect(res).toHaveProperty('count', 1);
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
