const factory = require('./factory');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
const findOne = factory.findOne('program');

// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise
const findAll = factory.findAll('program');

// edit programs
const edit = factory.update('program');

// delete program
const deleteProgram = factory.remove('program');

// create program
const addProgram = factory.create('program');

// count programs
const count = factory.count('program');

module.exports = {
  findOne,
  findAll,
  count,
  edit,
  deleteProgram,
  addProgram,
};
