const express = require('express');
const Student = require('./../models/Student');
const StudentCourse = require('./../models/StudentCourse');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

const schematools = require('./../services/schematools');

module.exports = () => {
  const router = express.Router();

  // Get many students
  router.get('/', authorizeSession, schematools.readMany('student', Student.findAll));
  // Get one student
  router.get('/:id(\\d+)', authorizeSession, schematools.readOne('student', Student.findOne));
  // Edit student
  router.put(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.update('student', Student.edit)
  );
  // Add student
  router.post(
    '/',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.create('student', Student.addStudent)
  );
  // Delete student
  router.delete(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.remove('student', Student.deleteStudent)
  );

  // Insert or update student's courses
  router.put(
    '/:student(\\d+)/course/:course(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.insertOrUpdate('student_course', StudentCourse.addOrUpdateCourse)
  );

  // Find many courses student taking
  router.get(
    '/:student(\\d+)/course/',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.readManyJoined('student_course', StudentCourse.findAllCourses)
  );

  // Find one course in student courses
  router.get(
    '/:student(\\d+)/course/:course(\\d+)',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.readOneJoined('student_course', StudentCourse.findOneCourse)
  );

  // Delete course from student courses
  router.delete(
    '/:student(\\d+)/course/:course(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    schematools.removeWithCriteria('student_course', StudentCourse.deleteCourse)
  );

  return router;
};
