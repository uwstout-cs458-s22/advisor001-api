const log = require('loglevel');
const HttpError = require('http-errors');
const validate = require('./validator');

const { extractKeys, renameKeys, isEmpty } = require('./utils');

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

function createSpecificCriteria(paramKeys, params) {
  const retval = {};
  paramKeys.forEach((paramName) => {
    retval[paramName] = { id: params[paramName] };
  });
  return retval;
}

module.exports = {
  middlemen,
  createSpecificCriteria,
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
        // che-ck num params, param validity
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
    const schemaKeys = Object.keys(validate[tableName]);
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
        if (
          paramKeys.length <= 1 ||
          paramKeys.some((table) => !req.params[table] || req.params[table] === '')
        ) {
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

        // try deletion
        const result = await modelFunc(criteria);
        if (isEmpty(result)) {
          throw HttpError.NotFound();
        }
        // success
        log.info(
          `${req.method} ${
            req.originalUrl
          } success: deleted from ${tableName} where ${JSON.stringify(criteria)}`
        );
        return res.send(result);
      } catch (error) {
        next(error);
      }
    };
  },
};
