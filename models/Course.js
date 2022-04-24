const factory = require('./factory');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
const findOne = factory.findOne('course');

// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise
const findAll = factory.findAll('course');

// if successful delete, return course was deleted
const deleteCourse = factory.remove('course');

// Adds course to database
const addCourse = factory.create('course');

// Edits existing course
const edit = factory.update('course');

// Count
const count = factory.count('course');

module.exports = {
  findOne,
  findAll,
  addCourse,
  deleteCourse,
  edit,
  count,
};
