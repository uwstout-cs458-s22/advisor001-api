const factory = require('./factory');
const join = require('../services/joiner');

const fromTable = 'student_course';

const joinStr = join(fromTable, 'student') + join(fromTable, 'course') + join(fromTable, 'term');

const selectValues = {
  term: ['id', 'startyear', 'semester'],
  course: '*',
};

module.exports = {
  addOrUpdateCourse: factory.combinedInsertUpdate(fromTable),
  deleteCourse: factory.removeWithCriteria(fromTable),
  findOneCourse: factory.findOneJoined(selectValues, fromTable, joinStr),
  findAllCourses: factory.findAllJoined(selectValues, fromTable, joinStr),
  // select student terms
  findStudentTerms: factory.findAllJoined('term', fromTable, joinStr),
};
