global.jest.init(false); // Init without models
global.jest.init_db();
const { dataForGetCourse, db } = global.jest;

const Course = require('./Course');

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
      await Course.findOne({ id });

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('should return a single Course', async () => {
      const row = dataForGetCourse(1)[0];
      const id = row.id;

      db.query.mockResolvedValue({ rows: [row] });
      const course = await Course.findOne({ id });

      for (const key in Object.keys(row)) {
        expect(course).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound course', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const course = await Course.findOne({ id: 123 });

      expect(Object.keys(course)).toHaveLength(0);
    });

    test('should throw error for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Course.findOne({ id: 123 })).rejects.toThrowError('a testing database error');
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
    function doAdd(newCourse) {
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

    test('Adding single course success, but no returned result', async () => {
      const course = dataForGetCourse(1)[0];
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(Course.addCourse(course)).rejects.toThrowError(
        'Unexpected DB Condition, insert sucessful with no returned record'
      );
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
describe('editing a course', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  test('Course.edit', async () => {
    const data = dataForGetCourse(1);
    const row = data[0];
    row.credits = 1;
    row.prefix = 'CS';
    const newValues = { credits: row.credits, prefix: row.prefix };

    db.query.mockResolvedValue({ rows: data });
    const course = await Course.edit(row.id, newValues);

    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      'UPDATE "course" SET "credits"=$2, "prefix"=$3 WHERE "id"=$1 RETURNING *;'
    );
    expect(db.query.mock.calls[0][1]).toHaveLength(3);
    expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    expect(db.query.mock.calls[0][1][1]).toBe(row.credits);
    expect(db.query.mock.calls[0][1][2]).toBe(row.prefix);
    for (const key in Object.keys(row)) {
      expect(course).toHaveProperty(key, row[key]);
    }
  });

  test('Course.edit with database error', async () => {
    const data = dataForGetCourse(1);
    const row = data[0];
    row.credits = 1;
    row.prefix = 'CS';
    const newValues = { credits: row.credits, prefix: row.prefix };

    // error thrown during call to db query
    db.query.mockRejectedValueOnce(new Error('a testing database error'));
    await expect(Course.edit(row.id, newValues)).rejects.toThrowError('a testing database error');

    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      'UPDATE "course" SET "credits"=$2, "prefix"=$3 WHERE "id"=$1 RETURNING *;'
    );
    expect(db.query.mock.calls[0][1]).toHaveLength(3);
    expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    expect(db.query.mock.calls[0][1][1]).toBe(row.credits);
    expect(db.query.mock.calls[0][1][2]).toBe(row.prefix);
  });

  test('Course.edit with bad input', async () => {
    await expect(Course.edit('id', 'bad input')).rejects.toThrowError('Id is required.');
    expect(db.query.mock.calls).toHaveLength(0);
  });

  test('Course.edit with no input', async () => {
    await expect(Course.edit()).rejects.toThrowError('Id is required.');
    expect(db.query.mock.calls).toHaveLength(0);
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
  test('Unexpected condition, no return value', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(1);
    expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "course"`);
    await expect(Course.count()).rejects.toThrowError('Some Error Occurred');
  });
});
