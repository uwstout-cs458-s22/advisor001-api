const log = require('loglevel');
const HttpError = require('http-errors');

const { isString, isBoolean, isNully, extractKeys, renameKeys, isEmpty } = require('./utils');
const { isInteger } = Number;
const isForeignKey = (x) => isInteger(x) || (isString(x) && isInteger(Number(x)));

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

function createSpecificCriteria(tableList, paramList) {
  return Object.fromEntries(
    Object.values(paramList).map((param, index) => [tableList[index], { id: param }])
  );
}

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

  // CREATE maker
  create: (tableName, modelFunc, statusCode = 201) => {
    return async (req, res, next) => {
      try {
        // validate
        const validated = validate[tableName](req.body, false);
        if (!validated) {
          throw HttpError.BadRequest('Invalid Parameters');
        }
        // do create
        const result = await modelFunc(validated);
        // result should be truthy
        if (!result || isEmpty(result)) {
          throw HttpError.InternalServerError();
        }
        // success
        log.info(`${req.method} ${req.originalUrl} success: created ${tableName} ${result.id}`);
        res.status(statusCode).send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // UPDATE maker
  update: (tableName, modelFunc, key = 'id') => {
    return async (req, res, next) => {
      try {
        const id = req.params[key];
        if (!id || id === '') {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        // validate
        const validated = validate[tableName](req.body, true);
        if (!validated) {
          throw HttpError.BadRequest('Invalid Parameters');
        }
        if (isEmpty(validated)) {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        // do create
        const result = await modelFunc(id, validated);
        if (isEmpty(result)) {
          throw HttpError.NotFound();
        }
        // success
        log.info(`${req.method} ${req.originalUrl} success: updated ${tableName} ${id}`);
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // READ maker (one)
  readOne: (tableName, modelFunc, key = 'id') => {
    return async (req, res, next) => {
      try {
        const id = req.params[key];
        if (!id || id === '') {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        // use params to get one
        const result = await modelFunc({ [key]: id });
        if (isEmpty(result)) {
          throw HttpError.NotFound();
        }
        // success
        log.info(`${req.method} ${req.originalUrl} success: returning ${tableName} ${id}`);
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // READ maker (many)
  readMany: (tableName, modelFunc) => {
    return async (req, res, next) => {
      try {
        const results = await modelFunc(null, req.query.limit, req.query.offset);
        log.info(
          `${req.method} ${req.originalUrl} success: returning ${results.length} ${tableName}(s)`
        );
        return res.send(results);
      } catch (error) {
        next(error);
      }
    };
  },

  // DELETE maker
  remove: (tableName, modelFunc, key = 'id') => {
    return async (req, res, next) => {
      try {
        const id = req.params[key];
        if (!id || id === '') {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        // try deletion
        const result = await modelFunc(id);
        if (isEmpty(result)) {
          throw HttpError.NotFound();
        }
        // success
        log.info(`${req.method} ${req.originalUrl} success: deleted ${tableName} ${id}`);
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // --- JOINED stuff ---

  // READ ONE maker, joined
  readOneJoined: (tableName, modelFunc) => {
    return async (req, res, next) => {
      try {
        const paramKeys = Object.keys(req.params);
        // check num params, param validity
        if (
          paramKeys.length <= 1 ||
          paramKeys.some((table) => !req.params[table] || req.params[table] === '')
        ) {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        // params are good
        const specificCriteria = createSpecificCriteria(paramKeys, req.params);
        // try reading
        const result = await modelFunc(specificCriteria);
        if (isEmpty(result)) {
          throw HttpError.NotFound();
        }
        // success
        log.info(
          `${req.method} ${
            req.originalUrl
          } success: returning ${tableName} join result ${JSON.stringify(specificCriteria)}`
        );
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // READ MANY maker, joined
  readManyJoined: (tableName, modelFunc) => {
    return async (req, res, next) => {
      try {
        // require first table's primary key
        const paramKeys = Object.keys(req.params);
        const id = req.params[paramKeys[0]];
        // check first id
        if (!id || id === '') {
          throw HttpError.BadRequest('Required Parameters Missing');
        }
        const specificCriteria = createSpecificCriteria(paramKeys, req.params);
        // try deletion
        const result = await modelFunc(specificCriteria, req.query.limit, req.query.offset);
        // success
        log.info(
          `${req.method} ${
            req.originalUrl
          } success: returning ${tableName} join result ${JSON.stringify(specificCriteria)}`
        );
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // INSERT OR UPDATE maker
  insertOrUpdate: (tableName, modelFunc, statusCode = 200) => {
    // helper lists
    const foreignKeyList = Object.values(middlemen[tableName]);
    const schemaKeys = Object.keys(schemaFields[tableName]);
    // remove foreign keys from key list
    foreignKeyList.forEach((key) => {
      const index = schemaKeys.indexOf(key);
      if (index >= 0) schemaKeys.splice(index, 1);
    });

    log.debug(`KEY LIST FOR ${tableName}: ${JSON.stringify(schemaKeys)}`);
    log.debug(`FK  LIST FOR ${tableName}: ${JSON.stringify(foreignKeyList)}`);

    return async (req, res, next) => {
      try {
        // keys specified in params
        const paramKeys = Object.keys(req.params);
        // make sure all params valid
        if (paramKeys.some((table) => !req.params[table] || req.params[table] === '')) {
          throw HttpError.BadRequest('Required Parameters Missing');
        }

        // convert table names to foreign key names
        const uniqueKeys = renameKeys(req.params, middlemen[tableName]);
        // add any keys that might be in body
        Object.assign(uniqueKeys, extractKeys(req.body, ...foreignKeyList));
        // new values
        const newValues = extractKeys(req.body, ...schemaKeys);
        const combined = Object.assign({}, uniqueKeys, newValues);

        log.debug(`COMBINED INFO: ${JSON.stringify(combined)}`);

        const validated = validate[tableName](combined, false);
        if (!validated) {
          throw HttpError.BadRequest('Invalid Parameters');
        }
        // do create
        const result = await modelFunc(uniqueKeys, newValues);
        // result should be truthy
        if (!result || isEmpty(result)) {
          throw HttpError.InternalServerError();
        }
        // success
        log.info(
          `${req.method} ${req.originalUrl} success: created or updated ${tableName} ${result.id}`
        );
        res.status(statusCode).send(result);
      } catch (error) {
        next(error);
      }
    };
  },

  // remove connecting entry from middle-man (USE WITH CAUTION)
  removeWithCriteria: (tableName, modelFunc) => {
    // helper list
    const foreignKeyList = Object.values(middlemen[tableName]);
    return async (req, res, next) => {
      try {
        const paramKeys = Object.keys(req.params);
        const id = req.params[paramKeys[0]];
        // check num params, param validity
        if (
          paramKeys.length <= 1 ||
          paramKeys.some((table) => !req.params[table] || req.params[table] === '')
        ) {
          throw HttpError.BadRequest('Required Parameters Missing');
        }

        // convert table names to foreign key names
        const criteria = renameKeys(req.params, middlemen[tableName]);
        // add any keys that might be in body
        Object.assign(criteria, extractKeys(req.body, ...foreignKeyList));

        log.debug(`CRITERIA: ${JSON.stringify(criteria)}`);

        // try deletion
        const result = await modelFunc(criteria);
        if (isEmpty(result)) {
          throw HttpError.NotFound();
        }
        // success
        log.info(`${req.method} ${req.originalUrl} success: deleted ${tableName} ${id}`);
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },
};
