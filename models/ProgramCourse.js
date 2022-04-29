const factory = require('./factory');
const join = require('../services/joiner');

const joinStr = join('program_course', 'program') + join('program_course', 'course');

module.exports = {
  addOrUpdateCourse: factory.combinedInsertUpdate('program_course'),
  deleteCourse: factory.removeWithCriteria('program_course'),
  findOneCourse: factory.findOneJoined('program_course', 'course', joinStr),
  findAllCourses: factory.findAllJoined('program_course', 'course', joinStr),
};
