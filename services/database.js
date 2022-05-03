const log = require('loglevel');
module.exports.db = {};

// for reading sql file
const fs = require('fs');
const path = require('path');
/**
 * Initializes connection to database and prewritten SQL schemas
 * 
 * @returns {void}
 */
function initialize() {
  const { Pool } = require('pg');
  const { databaseUrl } = require('./environment');
  const parse = require('pg-connection-string').parse;
  const config = parse(databaseUrl);
  module.exports.db = new Pool(config);

  // read and execute query
  const command = fs.readFileSync(path.resolve(__dirname, '../schema.sql'), {
    encoding: 'utf8',
    flag: 'r',
  });

  module.exports.db.query(command, (err, res) => {
    if (err) {
      throw err;
    }
    log.info('Server successfully connected to database and setup schema.');
  });

  log.info(`database has ${module.exports.db.totalCount} clients existing within the pool`);
}

module.exports.initialize = initialize;
