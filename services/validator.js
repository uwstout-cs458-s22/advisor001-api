const { isString, isBoolean, isNully, extractKeys } = require('./utils');
const { isInteger } = Number;
const isForeignKey = (x) => isInteger(x) || (isString(x) && isInteger(Number(x)));

// all fields and their validation
// prettier-ignore
const schemaFields = {
  user: {
    enable: (x) =>      isNully(x) || isBoolean(x),
    role: (x) =>        isNully(x) || (isString(x) && ['user', 'director', 'admin'].includes(x)),
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
    account: (x) =>     isNully(x) || isForeignKey(x), // optional foreign
    program: (x) =>     isNully(x) || isForeignKey(x), // optional foreign
  },
  course_prerequisite: {
    course:             isForeignKey, // foreign key
    requires:           isForeignKey, // foreign key
  },
  course_requirement: {
    course:             isForeignKey, // foreign key
    fulfills:           isForeignKey, // foreign key
  },
  program_course: {
    program:            isForeignKey, // foreign key
    requires:           isForeignKey, // foreign key
  },
  student_course: {
    student:            isForeignKey, // foreign key
    course:             isForeignKey, // foreign key
    term:               isForeignKey, // foreign key
    taken:              isBoolean,
  }
};

// Validate usage:
//    validate.user(someUserObj);
//    validate.user.email(someEmailString);
//    validate.course.description(someDescription);
//    ...
// If editing (allow nulls):
//    validate.course(courseBeingEdited, true);
// Return value:
//    an obj ready for whereParams, or FALSE if input was rejected.
//    example:
//      {foo: 1, bar: 2, title: '', description: ''}
//      becomes just    {title: '', description: ''}

// contains validators for each table
const validate = Object.fromEntries(
  // map a table name to its new validator function
  // this will generate [ [key, value], [key, value], ... ]
  Object.keys(schemaFields).map((tableName) => {
    // properties of table
    const properties = Object.keys(schemaFields[tableName]);

    // ---- BEGIN VALIDATOR ----
    const validator = (obj, editing = false) => {
      // extract obj properties
      const result = obj ? extractKeys(obj, ...properties) : {};

      // helper: validate one property
      const propertyIsValid = (propName) => {
        const isValidField = schemaFields[tableName][propName];
        const value = result[propName];
        return isValidField(value);
      };
      // IF EDITING, only check defined properties
      if (editing) {
        const propsBeingEdited = Object.keys(result);
        if (propsBeingEdited.every(propertyIsValid)) {
          return result;
        }
      }
      // NOT EDITING, so check all properties
      if (properties.every(propertyIsValid)) {
        return result;
      }
      // the input was NOT valid
      return false;
    };
    // ---- END VALIDATOR ----

    // copy all individual field validators to validator func
    properties.forEach((propName) => {
      validator[propName] = schemaFields[tableName][propName];
    });

    // done, add validator function to exports
    return [tableName, validator];
  })
);

module.exports = validate;
