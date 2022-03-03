const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues, updateValues } = require('../services/sqltools');
const env = require('../services/environment');


// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
	const { text, params } = whereParams(criteria);
	const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
	if (res.rows.length > 0) {
	  log.debug(`Successfully found user from db with criteria: ${text}, ${JSON.stringify(params)}`);
	  return res.rows[0];
	}
	log.debug(`No users found in db with criteria: ${text}, ${JSON.stringify(params)}`);
	return {};
  }



  module.exports = {
	findOne,
	// findAll,
	// create,
	// deleteUser,
	// edit,
  };
  