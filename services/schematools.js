const log = require('loglevel');
const HttpError = require('http-errors');

const { isString, isBoolean, isNully } = require('./utils');
const { isInteger } = Number;

const schemaGraph = {
  student: {
    term: 'student_course',
    course: 'student_course',
  },
  term: {
    course: 'student_course',
    student: 'student_course',
  },
  program: {
    course: 'program_course',
  },
  course: {
    term: 'student_course',
    student: 'student_course',
    requirement: 'course_requirement',
    program: 'program_course',
    course: 'course_prerequisite',
  },
  requirement: {
    course: 'course_requirement',
  },
};

const middlemen = {
  student_course: {
    term: 'term',
    student: 'student',
    course: 'course',
  },
  program_course: {
    program: 'program',
    requires: 'course',
  },
  course_requirement: {
    course: 'course',
    fulfills: 'requirement',
  },
  course_prereq: {
    course: 'course',
    requires: 'course',
  },
};

module.exports = {
  // all fields and their validators
  // prettier-ignore
  validator: {
    user: {
      email: (x) =>       isNully(x) || isString(x),
      enable: (x) =>      isNully(x) || isBoolean(x),
      role: (x) =>        isString(x) && ['user', 'director', 'admin'].includes(x),
      userId: (x) =>      isNully(x) || isString(x),
    },
    course: {
      prefix:             isString,
      suffix:             isString,
      title:              isString,
      description: (x) => isNully(x) || isString(x),
      credits: (x) =>     isInteger(x) && x > 0,
    },
    term: {
      title:              isString,
      description:        isString,
    },
    student: {
      displayname:        isString,
      account: (x) =>     isNully(x) || isInteger(x),
      program: (x) =>     isNully(x) || isInteger(x),
    },
  },

  // join helper, for making a join statement
  joiner: (...tables) => {
    if (tables.length > 0) {
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
        const mid = schemaGraph[curr][next];
        // validation -- middle man
        if (!middlemen[mid]) {
          throw HttpError.InternalServerError(`Table '${mid}' is not found in schema chain rules.`);
        }
        // validation -- middle man chain rules
        const currProp = middlemen[mid][curr];
        const nextProp = middlemen[mid][next];
        if (!currProp || !nextProp) {
          throw HttpError.InternalServerError(
            `Could not chain '${curr}' to '${next}' using chain rules '${mid}'`
          );
        }
        // chaining
        joinBlock += `JOIN "${mid}" ON "${curr}"."id" = "${mid}"."${currProp}"\n`;
        joinBlock += `JOIN "${next}" ON "${next}"."id" = "${mid}"."${nextProp}"\n`;
      }
      // done
      log.info('Successfully created a join string.');
      log.debug(`joinBlock: \n${joinBlock}`); // DEBUG

      return joinBlock;
    }
  },
};
