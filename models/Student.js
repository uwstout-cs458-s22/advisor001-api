const factory = require('./factory');

module.exports = {
  findOne: factory.findOne('student'),
  findAll: factory.findAll('student'),
  addStudent: factory.create('student'),
  edit: factory.update('student'),
  deleteStudent: factory.remove('student'),
};
