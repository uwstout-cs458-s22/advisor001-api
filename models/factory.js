// Welcome to the model factory
const {
  whereParams,
  insertValues,
  updateValues,
  insertOrUpdate,
  specificWhereParams,
  selectList,
} = require('../services/sqltools');

const { isEmpty, isObject } = require('../services/utils');
const { db } = require('../services/database');

const HttpError = require('http-errors');
const badData = HttpError.InternalServerError('Backend service received bad data!');
const unexpected = HttpError.InternalServerError(
  'Unexpected DB condition: success, but no data returned'
);

module.exports = {
  // find one generator
  findOne: (fromTable) => {
    return async (criteria) => {
      if (!criteria || isEmpty(criteria)) throw badData;
      const { text, params } = whereParams(criteria);
      const res = await db.query(`SELECT * from "${fromTable}" ${text} LIMIT 1;`, params);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return {};
    };
  },

  // find all generator
  findAll: (fromTable) => {
    return async (criteria, limit = 100, offset = 0) => {
      const { text, params } = whereParams(criteria);
      const n = params.length;
      const p = params.concat([limit, offset]);
      const res = await db.query(
        `SELECT * from "${fromTable}" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`,
        p
      );
      // success
      return res.rows;
    };
  },

  // remove generator
  removeWithKey: (fromTable, key = 'id') => {
    return async (id) => {
      if (!id || isObject(id)) throw badData;
      // do delete
      const { text, params } = whereParams({ [key]: id });
      const res = await db.query(`DELETE FROM "${fromTable}" ${text} RETURNING *;`, params);
      // did it exist?
      if (res.rows.length > 0) {
        // success
        return res.rows[0];
      }
      return {};
    };
  },

  // create generator
  create: (fromTable) => {
    return async (properties) => {
      if (!isObject(properties)) throw badData;
      // the route should have validated
      const { text, params } = insertValues(properties);
      const res = await db.query(`INSERT INTO "${fromTable}" ${text} RETURNING *;`, params);
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
  update: (fromTable, key = 'id') => {
    return async (id, newValues) => {
      if (!id || !isObject(newValues)) throw badData;
      // the route should have validated
      const { text, params } = updateValues({ [key]: id }, newValues);
      const res = await db.query(`UPDATE "${fromTable}" ${text} RETURNING *;`, params);
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
  count: (fromTable) => {
    return async () => {
      const res = await db.query(`SELECT COUNT(*) FROM "${fromTable}"`);

      if (res.rows.length > 0) {
        return res.rows[0];
      }
      throw unexpected;
    };
  },

  // --- JOIN STUFF ---

  // combined insert/update generator for tables with foreign keys
  combinedInsertUpdate: (fromTable) => {
    return async (criteriaList, newValues) => {
      // criteria list is for uniquely constrained foreign keys
      // new values is for other data
      if (!isObject(criteriaList)) throw badData;
      const numCriteria = Object.keys(criteriaList).length;
      if (numCriteria <= 0) throw badData;

      const { text, params } = insertOrUpdate(criteriaList, newValues);
      // console.log(`INSERT INTO ${fromTable} ${text} RETURNING *;`);
      const res = await db.query(`INSERT INTO "${fromTable}" ${text} RETURNING *;`, params);

      if (res.rows.length > 0) {
        return res.rows[0];
      }
      throw unexpected;
    };
  },

  // find one with join
  findOneJoined: (selTables, fromTable, joinStr = '') => {
    // what properties to select
    const selStr = selectList(selTables);
    // the model func
    return async (specificCriteria) => {
      if (!specificCriteria || isEmpty(specificCriteria)) throw badData;
      const { text, params } = specificWhereParams(specificCriteria);
      const res = await db.query(
        `SELECT ${selStr} FROM "${fromTable}" ${joinStr} ${text} LIMIT 1;`,
        params
      );
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return {};
    };
  },

  // find all with join
  findAllJoined: (selTables, fromTable, joinStr = '') => {
    // what properties to select
    const selStr = selectList(selTables);
    // the model func
    return async (specificCriteria, limit = 100, offset = 0) => {
      const { text, params } = specificWhereParams(specificCriteria);
      const n = params.length;
      const p = params.concat([limit, offset]);
      const res = await db.query(
        `SELECT ${selStr} FROM "${fromTable}" ${joinStr} ${text} LIMIT $${n + 1} OFFSET $${n + 2};`,
        p
      );
      // success
      return res.rows;
    };
  },

  // remove with criteria (USE WITH CAUTION!);
  removeWithCriteria: (fromTable, joinStr) => {
    return async (criteria) => {
      // disallow falsy, non-object
      if (!isObject(criteria)) throw badData;
      const numCriteria = Object.keys(criteria).length;
      // must have at least 2 criteria, for safety
      if (numCriteria <= 1) throw badData;
      // do delete
      const { text, params } = whereParams(criteria);
      const res = await db.query(
        `DELETE FROM "${fromTable}" ${
          joinStr !== undefined ? [joinStr, text].join(' ') : text
        } RETURNING *;`,
        params
      );
      // did it exist?
      if (res.rows.length > 0) {
        // success
        return res.rows[0];
      }
      return {};
    };
  },
};
