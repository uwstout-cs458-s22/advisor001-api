const factory = require('./factory');

module.exports = {
  addOrUpdateCourse: factory.combinedInsertUpdate('student_course'),
  deleteCourse: factory.removeWithCriteria('student_course'),
  findOneCourse: factory.findOneJoined('student', 'course'),
  findAllCourses: factory.findAllJoined('student', 'course'),
};
