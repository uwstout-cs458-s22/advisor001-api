// Welcome to the model factory
const {
  whereParams,
  insertValues,
  updateValues,
  insertOrUpdate,
  specificWhereParams,
} = require('../services/sqltools');

const { isEmpty, isObject } = require('../services/utils');
const { db } = require('../services/database');

const HttpError = require('http-errors');
const badData = HttpError.InternalServerError('Backend service received bad data!');
const unexpected = HttpError.InternalServerError(
  'Unexpected DB condition: success, but no data returned'
);

const { connect } = require('../services/schematools');

module.exports = {
  // find one generator
  findOne: (tableName) => {
    return async (criteria) => {
      if (!criteria || isEmpty(criteria)) throw badData;
      const { text, params } = whereParams(criteria);
      const res = await db.query(`SELECT * from "${tableName}" ${text} LIMIT 1;`, params);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return {};
    };
  },

  // find all generator
  findAll: (tableName) => {
    return async (criteria, limit = 100, offset = 0) => {
      const { text, params } = whereParams(criteria);
      const n = params.length;
      const p = params.concat([limit, offset]);
      const res = await db.query(
        `SELECT * from "${tableName}" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`,
        p
      );
      // success
      return res.rows;
    };
  },

  // remove generator
  remove: (tableName, key = 'id') => {
    return async (id) => {
      if (!id || isObject(id)) throw badData;
      // do delete
      const { text, params } = whereParams({ [key]: id });
      const res = await db.query(`DELETE FROM "${tableName}" ${text} RETURNING *;`, params);
      // did it exist?
      if (res.rows.length > 0) {
        // success
        return res.rows[0];
      }
      return {};
    };
  },

  // create generator
  create: (tableName) => {
    return async (properties) => {
      if (!properties || !isObject(properties)) throw badData;
      // the route should have validated
      const { text, params } = insertValues(properties);
      const res = await db.query(`INSERT INTO "${tableName}" ${text} RETURNING *;`, params);
      // did it work?
      if (res.rows.length > 0) {
        // success
        return res.rows[0];
      }
      // db should have thrown
      throw unexpected;
    };
  },

  // update generator
  update: (tableName, key = 'id') => {
    return async (id, newValues) => {
      if (!id || !newValues || !isObject(newValues)) throw badData;
      // the route should have validated
      const { text, params } = updateValues({ [key]: id }, newValues);
      const res = await db.query(`UPDATE "${tableName}" ${text} RETURNING *;`, params);
      // did it work?
      if (res.rows.length > 0) {
        // success
        return res.rows[0];
      }
      // db should have thrown
      throw unexpected;
    };
  },

  // count generator
  count: (tableName) => {
    return async () => {
      const res = await db.query(`SELECT COUNT(*) FROM "${tableName}"`);

      if (res.rows.length > 0) {
        return res.rows[0];
      }
      throw unexpected;
    };
  },

  // --- JOIN STUFF ---

  // combined insert/update generator for tables with foreign keys
  combinedInsertUpdate: (tableName) => {
    return async (criteriaList, newValues) => {
      // criteria list is for uniquely constrained foreign keys
      // new values is for other data
      const numCriteria = Object.keys(criteriaList).length;
      if (numCriteria <= 0) throw badData;

      const { text, params } = insertOrUpdate(criteriaList, newValues);
      // console.log(`INSERT INTO ${tableName} ${text} RETURNING *;`);
      const res = await db.query(`INSERT INTO ${tableName} ${text} RETURNING *;`, params);

      if (res.rows.length > 0) {
        return res.rows[0];
      }
      throw unexpected;
    };
  },

  // find one with join
  findOneJoined: (...tables) => {
    const joinStr = connect(...tables);
    const lastTable = tables.pop();
    const firstTable = tables[0];

    return async (specificCriteria) => {
      if (!specificCriteria || isEmpty(specificCriteria)) throw badData;
      const { text, params } = specificWhereParams(specificCriteria);
      const res = await db.query(
        `SELECT "${lastTable}".* FROM "${firstTable}" ${joinStr} ${text} LIMIT 1;`,
        params
      );
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return {};
    };
  },

  // find all with join
  findAllJoined: (...tables) => {
    const joinStr = connect(...tables);
    const lastTable = tables.pop();
    const firstTable = tables[0];

    return async (specificCriteria, limit = 100, offset = 0) => {
      const { text, params } = specificWhereParams(specificCriteria);

      const n = params.length;
      const p = params.concat([limit, offset]);
      const res = await db.query(
        `SELECT "${lastTable}".* FROM "${firstTable}" ${joinStr} ${text} LIMIT $${n + 1} OFFSET $${
          n + 2
        };`,
        p
      );
      // success
      return res.rows;
    };
  },

  // remove with criteria (USE WITH CAUTION!);
  removeWithCriteria: (middleManName) => {
    return async (criteria) => {
      if (!criteria || !isObject(criteria)) throw badData;
      // do delete
      const { text, params } = whereParams(criteria);
      const res = await db.query(`DELETE FROM "${middleManName}" ${text} RETURNING *;`, params);
      // did it exist?
      if (res.rows.length > 0) {
        // success
        return res.rows[0];
      }
      return {};
    };
  },
};
