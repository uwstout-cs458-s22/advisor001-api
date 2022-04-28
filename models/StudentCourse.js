const factory = require('./factory');
const join = require('../services/joiner');

const joinStr =
  join('student_course', 'student') +
  join('student_course', 'course') +
  join('student_course', 'term');

module.exports = {
  addOrUpdateCourse: factory.combinedInsertUpdate('student_course'),
  deleteCourse: factory.removeWithCriteria('student_course'),
  findOneCourse: factory.findOneJoined('student_course', 'course' + joinStr),
  findAllCourses: factory.findAllJoined('student_course', 'course' + joinStr),
};
