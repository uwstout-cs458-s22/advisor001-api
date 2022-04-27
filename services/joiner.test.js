const connect = require('./joiner');

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
    const joinStr = connect('program', 'program_course');
    expect(typeof joinStr).toBe('string');
    expect(joinStr).not.toHaveLength(0);
    expect(joinStr).toEqual('JOIN "program_course" ON "program_course"."program" = "program"."id"');
  });
  test('Try a five way join', () => {
    // here we go
    const joinStr = connect(
      'student',
      'student_course',
      'course',
      'course_requirement',
      'requirement'
    );
    expect(typeof joinStr).toBe('string');
    expect(joinStr).not.toHaveLength(0);
    expect(joinStr).toEqual(
      'JOIN "student_course" ON "student_course"."student" = "student"."id" ' +
        'JOIN "course" ON "course"."id" = "student_course"."course" ' +
        'JOIN "course_requirement" ON "course_requirement"."course" = "course"."id" ' +
        'JOIN "requirement" ON "requirement"."id" = "course_requirement"."fulfills"'
    );
  });
  test('Try a double-joining connection', async () => {
    const joinStr = connect('course_prerequisite', 'course');
    expect(typeof joinStr).toBe('string');
    expect(joinStr).not.toHaveLength(0);
    expect(joinStr).toBe(
      'JOIN "course" AS "course_0" ON "course_0"."id" = "course_prerequisite"."course" ' +
        'JOIN "course" AS "course_1" ON "course_1"."id" = "course_prerequisite"."requires"'
    );
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
    await expect(tryWith('student', 'student_course', 'course', 'invalid')).rejects.toThrowError(
      "No path from table 'course' to table 'invalid'"
    );
  });
});
