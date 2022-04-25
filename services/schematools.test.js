const { connect, validate } = require('./schematools.js');

// good and bad for each
const tests = {
  user: {
    good: {
      enable: true,
      role: 'admin',
    },
    bad: {
      enable: 'foo',
      role: 'bar',
    },
  },
  course: {
    good: {
      prefix: 'CS',
      suffix: '442',
      title: 'Operating Systems',
      description: null,
      credits: 3,
    },
    bad: {
      prefix: null,
      suffix: 123,
      title: undefined,
      description: false,
      credits: '3',
    },
  },
  term: {
    good: {
      title: 'Spring 2022',
      startyear: 2021,
      semester: 2,
    },
    bad: {
      title: undefined,
      startyear: true,
      semester: '2',
    },
  },
  program: {
    good: {
      title: 'Our Program',
      description: 'Our Description',
    },
    bad: {
      title: null,
      description: 2,
    },
  },
  student: {
    good: {
      displayname: 'John Doe',
      account: undefined,
      program: '123', // param strings should work as foreign keys
    },
    bad: {
      displayname: undefined,
      account: '1.25', // not a foreign key
      program: true,
    },
  },
  course_prerequisite: {
    good: {
      course: 1,
      requires: 2,
    },
    bad: {
      course: null,
      requires: undefined,
    },
  },
  course_requirement: {
    good: {
      course: '3', // param strings should work as foreign keys
      fulfills: 4,
    },
    bad: {
      course: false,
      fulfills: true,
    },
  },
  program_course: {
    good: {
      program: 5,
      requires: '6', // param strings should work as foreign keys
    },
    bad: {
      program: 'Computer Science',
      requires: 1.5,
    },
  },
  student_course: {
    good: {
      student: '7',
      course: '8',
      term: 9,
      taken: true,
    },
    bad: {
      student: 'John Doe',
      course: null,
      term: 'foo',
      taken: undefined,
    },
  },
};
const allOfOurTables = Object.keys(tests);

describe('Schema tools tests', () => {
  describe('Joiner tests', () => {
    // helper for exceptions
    function tryWith(...params) {
      return new Promise((resolve, reject) => {
        try {
          const res = connect(...params);
          resolve(res);
        } catch (error) {
          reject(error);
        }
      });
    }

    test('Try no parameters', async () => {
      const msg = 'This tool requires at least two parameters.';
      await expect(tryWith()).rejects.toThrowError(msg);
      await expect(tryWith('')).rejects.toThrowError(msg);
      await expect(tryWith('foo')).rejects.toThrowError(msg);
      await expect(tryWith('foo', '')).rejects.not.toThrowError(msg);
    });
    test('Try a two way join', () => {
      // here we go
      const joinStr = connect('program', 'course');
      expect(typeof joinStr).toBe('string');
      expect(joinStr).not.toHaveLength(0);
      expect(joinStr).toEqual(
        'JOIN "program_course" ON "program"."id" = "program_course"."program"\n' +
          'JOIN "course" ON "course"."id" = "program_course"."requires"\n'
      );
    });
    test('Try a three way join', () => {
      // here we go
      const joinStr = connect('student', 'course', 'requirement');
      expect(typeof joinStr).toBe('string');
      expect(joinStr).not.toHaveLength(0);
      expect(joinStr).toEqual(
        'JOIN "student_course" ON "student"."id" = "student_course"."student"\n' +
          'JOIN "course" ON "course"."id" = "student_course"."course"\n' +
          'JOIN "course_requirement" ON "course"."id" = "course_requirement"."course"\n' +
          'JOIN "requirement" ON "requirement"."id" = "course_requirement"."fulfills"\n'
      );
    });
    test('Try a self-join', async () => {
      const msg = 'This tool does not support self-chaining!';
      await expect(tryWith('course', 'course')).rejects.toThrowError(msg);
      await expect(tryWith('term', 'term')).rejects.toThrowError(msg);
      await expect(tryWith('student', 'student')).rejects.toThrowError(msg);
      await expect(tryWith('program', 'program')).rejects.toThrowError(msg);
      await expect(tryWith('requirement', 'requirement')).rejects.toThrowError(msg);

      // User table is not included in join rules
      // It will get a different error
      await expect(tryWith('user', 'user')).rejects.not.toThrowError(msg);

      // with invalid first table
      await expect(tryWith('invalid', 'term')).rejects.not.toThrowError(msg);
      await expect(tryWith('invalid', 'invalid')).rejects.not.toThrowError(msg);
    });
    test('Try a join with a nonexistent table (first param)', async () => {
      await expect(tryWith('invalid', 'student')).rejects.toThrowError(
        "Table 'invalid' is not found in the schema graph."
      );
      await expect(tryWith('', 'student')).rejects.toThrowError(
        "Table '' is not found in the schema graph."
      );
      // not plural
      await expect(tryWith('students', 'course')).rejects.toThrowError(
        "Table 'students' is not found in the schema graph."
      );
    });
    test('Try a join with a nonexistent table (second param)', async () => {
      await expect(tryWith('course', 'invalid')).rejects.toThrowError(
        "No path from table 'course' to table 'invalid'"
      );
    });
    test('Try a join with a nonexistent table (third param)', async () => {
      await expect(tryWith('student', 'course', 'invalid')).rejects.toThrowError(
        "No path from table 'course' to table 'invalid'"
      );
    });
  });

  describe('Validator tests', () => {
    test('Make sure they generated properly', () => {
      for (const tableName of allOfOurTables) {
        expect(validate).toHaveProperty(tableName);
        expect(validate[tableName]).not.toBeFalsy();
      }
    });

    test.each(allOfOurTables)('Validator for table: %p', (tableName) => {
      // test all good
      const validator = validate[tableName];
      const good = tests[tableName].good;
      const bad = tests[tableName].bad;

      // test all good
      expect(validator(good)).toEqual(good);
      // test all bad
      expect(validator(bad)).toBeFalsy();

      // it should treat 0 params and empty objects the same
      const answers = [validator(), validator({})];
      expect(answers[0]).toEqual(answers[1]);

      const properties = Object.keys(validator);
      expect(properties.length).toBeGreaterThan(0);

      // test only one bad property at a time
      for (const prop of properties) {
        // make one bad
        const goodExceptOne = Object.assign({}, good);
        goodExceptOne[prop] = bad[prop];
        // test
        expect(validator(goodExceptOne)).toBeFalsy();
      }

      // test only one property
      for (const prop of properties) {
        const singlePropValidator = validator[prop];
        expect(singlePropValidator(good[prop])).toBeTruthy();
        expect(singlePropValidator(bad[prop])).toBeFalsy();
      }
    });
  });
});
