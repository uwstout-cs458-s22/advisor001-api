const factory = require('./factory');
const join = require('../services/joiner');

const fromTable = 'program_course';

const joinStr = join(fromTable, 'program') + join(fromTable, 'course');

module.exports = {
  addOrUpdateCourse: factory.combinedInsertUpdate(fromTable),
  deleteCourse: factory.removeWithCriteria(fromTable),
  findOneCourse: factory.findOneJoined('course', fromTable, joinStr),
  findAllCourses: factory.findAllJoined('course', fromTable, joinStr),
};
