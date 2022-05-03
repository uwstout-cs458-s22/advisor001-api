const log = require('loglevel');
const HttpError = require('http-errors');
const { isArray } = require('./utils');

// All possible joins
const schemaGraph = {
  // Join something to User
  user: {
    // Join student to user
    // Connect user's primary key 'id' to student's foreign key 'account'
    student: ['id', 'account'],
  },
  student: {
    user: ['account', 'id'],
    program: ['program', 'id'],
    student_course: ['id', 'student'],
  },
  program: {
    student: ['id', 'program'],
    program_course: ['id', 'program'],
  },
  program_course: {
    program: ['program', 'id'],
    course: ['requires', 'id'],
  },
  course: {
    course_requirement: ['id', 'course'],
    student_course: ['id', 'course'],
    program_course: ['id', 'requires'],
    // don't support joining course_prerequisite in this direction
  },
  course_requirement: {
    course: ['course', 'id'],
    requirement: ['fulfills', 'id'],
  },
  requirement: {
    course_requirement: ['id', 'fulfills'],
  },
  course_prerequisite: {
    // join same table twice
    course: [['course', 'requires'], 'id'],
  },
  student_course: {
    term: ['term', 'id'],
    student: ['student', 'id'],
    course: ['course', 'id'],
  },
  term: {
    student_course: ['id', 'term'],
  },
};

/**
 *
 * Function to properly stucture a SQL join statement
 *
 * @param  {String} curr Current
 * @param  {String} next
 * @param  {String} currProp
 * @param  {String} nextProp
 * @param  {String} suffix
 *
 * @returns {String}
 */
const join = (curr, next, currProp, nextProp, suffix) => {
  if (suffix !== undefined) {
    const newNext = `${next}_${suffix}`;
    return `JOIN "${next}" AS "${newNext}" ON "${newNext}"."${nextProp}" = "${curr}"."${currProp}"`;
  }
  return `JOIN "${next}" ON "${next}"."${nextProp}" = "${curr}"."${currProp}"`;
};

module.exports = (...tables) => {
  if (tables.length > 1) {
    let joinBlock = '';
    for (let i = 1; i < tables.length; ++i) {
      // chain next two tables
      const curr = tables[i - 1];
      const next = tables[i];
      // validation -- schema mapping
      if (!schemaGraph[curr]) {
        throw HttpError.InternalServerError(`Table '${curr}' is not found in the schema graph.`);
      }
      if (!schemaGraph[curr]?.[next]) {
        throw HttpError.InternalServerError(`No path from table '${curr}' to table '${next}'`);
      }
      const currProp = schemaGraph[curr][next][0];
      const nextProp = schemaGraph[curr][next][1];
      // self join?
      if (isArray(currProp)) {
        joinBlock += currProp
          .map((prop, index) => join(curr, next, prop, nextProp, index))
          .join(' ');
      } else {
        joinBlock += join(curr, next, currProp, nextProp) + ' ';
      }
    }
    // done
    log.info('Successfully created a join string.');
    log.debug(`joinBlock: \n${joinBlock}`); // DEBUG

    return joinBlock.trim();
  }
  throw HttpError.InternalServerError('This tool requires at least two parameters.');
};
