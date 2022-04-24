const factory = require('./factory');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
const findOne = factory.findOne('term');

// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise
const findAll = factory.findAll('term');

// if found delete Term
// if not found return {}
const deleteTerm = factory.remove('term');

// Adds term to database
const addTerm = factory.create('term');

// edit term
const edit = factory.update('term');

const count = factory.count('term');

module.exports = {
  findOne,
  findAll,
  deleteTerm,
  addTerm,
  count,
  edit,
};
