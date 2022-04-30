const express = require('express');
const Student = require('./../models/Student');
const StudentCourse = require('./../models/StudentCourse');
const { authorizeSession, setClearanceLevel } = require('./../services/auth');

const factory = require('./factory');

module.exports = () => {
  const router = express.Router();

  // Get many students
  router.get('/', authorizeSession, factory.readMany('student', Student.findAll));
  // Get one student
  router.get('/:id(\\d+)', authorizeSession, factory.readOne('student', Student.findOne));
  // Edit student
  router.put(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    factory.update('student', Student.edit)
  );
  // Add student
  router.post(
    '/',
    authorizeSession,
    setClearanceLevel('director'),
    factory.create('student', Student.addStudent)
  );
  // Delete student
  router.delete(
    '/:id(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    factory.removeWithKey('student', Student.deleteStudent)
  );

  // ---- Routes with joins ----

  // Insert or update student's courses
  router.put(
    '/:student(\\d+)/course/:course(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    factory.insertOrUpdate('student_course', StudentCourse.addOrUpdate)
  );
  // Add course using term in URL bar
  router.put(
    '/:student(\\d+)/term/:term(\\d+)',
    authorizeSession,
    setClearanceLevel('director'),
    factory.insertOrUpdate('student_course', StudentCourse.addOrUpdate)
  );
  // Find many courses student taking
  router.get(
    '/:student(\\d+)/course/',
    authorizeSession,
    factory.readManyJoined('student_course', StudentCourse.findAll)
  );
  // Find one course in student courses
  router.get(
    '/:student(\\d+)/course/:course(\\d+)',
    authorizeSession,
    factory.readOneJoined('student_course', StudentCourse.findOne)
  );
  // Delete course from student courses
  router.delete(
    '/:student(\\d+)/course/:course(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    factory.removeWithCriteria('student_course', StudentCourse.deleteStudentCourse)
  );
  // Delete course from student courses using term in URL bar
  router.delete(
    '/:student(\\d+)/term/:term(\\d+)?',
    authorizeSession,
    setClearanceLevel('director'),
    factory.removeWithCriteria('student_course', StudentCourse.deleteStudentCourse)
  );
  // Get a student's terms
  router.get(
    '/:student(\\d+)/term/',
    authorizeSession,
    factory.readManyJoined('student_course', StudentCourse.findStudentTerms)
  );
  // Get courses in a specific term
  router.get(
    '/:student(\\d+)/term/:term(\\d+)',
    authorizeSession,
    factory.readOneJoined('student_course', StudentCourse.findOne)
  );

  return router;
};
