const factory = require('./factory');
const join = require('../services/joiner');

const fromTable = 'student_course';

// prettier-ignore
const joinStr = join(fromTable, 'student')
  + join(fromTable, 'course')
  + join(fromTable, 'term');

const selectValues = {
  term: ['id', 'startyear', 'semester'],
  course: '*',
  student_course: ['taken'],
};

module.exports = {
  addOrUpdate: factory.combinedInsertUpdate(fromTable),
  deleteStudentCourse: factory.removeWithCriteria(fromTable),
  findOne: factory.findOneJoined(selectValues, fromTable, joinStr),
  findAll: factory.findAllJoined(selectValues, fromTable, joinStr),
  // select student terms
  findStudentTerms: factory.findAllJoined('term', fromTable, joinStr),
};
