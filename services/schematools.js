const log = require('loglevel');
const HttpError = require('http-errors');

const { isString, isBoolean, isNully, extractKeys } = require('./utils');
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
  },
  requirement: {
    course: 'course_requirement',
  },
};

// maps tables to their middlemen fields
const middlemen = {
  student_course: {
    term: 'term',
    student: 'student',
    course: 'course',
  },
  program_course: {
    program: 'program',
    course: 'requires',
  },
  course_requirement: {
    course: 'course',
    requirement: 'fulfills',
  },
};

// all fields and their validation
// prettier-ignore
const schemaFields = {
  user: {
    email: (x) =>       isNully(x) || isString(x),
    enable: (x) =>      isNully(x) || isBoolean(x),
    role: (x) =>        isNully(x) || (isString(x) && ['user', 'director', 'admin'].includes(x)),
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
    startyear: (x) =>   isInteger(x) && x > 0,
    semester: (x) =>    isInteger(x) && x >= 0 && x < 4,

  },
  program: {
    title:              isString,
    description:        isString,
  },
  student: {
    displayname:        isString,
    account: (x) =>     isNully(x) || isInteger(x),
    program: (x) =>     isNully(x) || isInteger(x),
  },
};

// generate functions so we can validate entire objects
const validate = Object.fromEntries(
  // this will generate [ [key, value], [key, value], ... ]
  Object.keys(schemaFields).map((tableName) => {
    // properties of table?
    const properties = Object.keys(schemaFields[tableName]);

    // validator function
    const validator = (obj) => {
      // make sure obj has valid properties
      if (
        properties.every((propName) => {
          const isValidField = schemaFields[tableName][propName];
          const value = obj?.[propName];
          return isValidField(value);
        })
      ) {
        // success
        // return all valid properties
        if (obj) return extractKeys(obj, ...properties);
        return {};
      }
      // the input was NOT valid
      return false;
    };

    // copy all individual field validators to validator func
    properties.forEach((propName) => {
      validator[propName] = schemaFields[tableName][propName];
    });

    // done, add validator function to exports
    return [tableName, validator];
  })
);

module.exports = {
  // Validate usage:
  //    validate.user(someUserObj);
  //    validate.user.email(someEmailString);
  //    validate.course.description(someDescription);
  //    ...
  // Return value:
  //    an obj ready for whereParams, or FALSE if input was rejected.
  //    example:
  //      {foo: 1, bar: 2, title: '', description: ''}
  //      becomes just    {title: '', description: ''}
  validate,

  // Connect usage:
  //    connect('program', 'course');
  //    connect('student', 'term', 'course');
  //    ...
  connect: (...tables) => {
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
        if (curr === next) {
          throw HttpError.InternalServerError('This tool does not support self-chaining!');
        }
        if (!schemaGraph[curr]?.[next]) {
          throw HttpError.InternalServerError(`No path from table '${curr}' to table '${next}'`);
        }
        const mid = schemaGraph[curr][next];
        // validation -- middle man
        if (!middlemen[mid]) {
          throw HttpError.InternalServerError(
            `Table '${curr}' needs middleman '${mid}' to join '${next}', but no rules were found!`
          );
        }
        // validation -- middle man chain rules
        const currProp = middlemen[mid][curr];
        const nextProp = middlemen[mid][next];
        if (!currProp || !nextProp) {
          throw HttpError.InternalServerError(
            `Rules for chaining '${curr}' to '${next}' are improperly configured! Check middlemen.${mid}`
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
    throw HttpError.InternalServerError('This tool requires at least two parameters.');
  },
};
