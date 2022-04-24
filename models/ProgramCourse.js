const factory = require('./factory');

module.exports = {
  addOrUpdateCourse: factory.combinedInsertUpdate('program_course'),
  deleteCourse: factory.removeWithCriteria('program_course'),
  findOneCourse: factory.findOneJoined('program', 'course'),
  findAllCourses: factory.findAllJoined('program', 'course'),
};
