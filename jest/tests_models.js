module.exports = {
  // User mocker
  User: () => {
    // mock list
    const mockList = {
      findOne: jest.fn().mockImplementation((criteria) => {
        return Object.assign(criteria, global.jest.dataForGetUser(1)[0]);
      }),
      findAll: jest.fn(),
      create: jest.fn(),
      edit: jest.fn(),
      deleteUser: jest.fn(),
      count: jest.fn(),
    };
    // do the mock
    jest.mock('../models/User', () => {
      const { hasMinimumPermission } = jest.requireActual('../models/User');
      return {
        ...mockList,
        hasMinimumPermission,
      };
    });

    // add mock resetter
    const User = require('../models/User');
    User.resetAllMocks = function () {
      for (const mockName of Object.keys(mockList)) {
        User[mockName].mockReset();
        User[mockName].mockResolvedValue(null);
      }
    };
    return User;
  },

  // Course mocker
  Course: () => {
    // mock list
    const mockList = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      addCourse: jest.fn(),
      deleteCourse: jest.fn(),
      edit: jest.fn(),
      count: jest.fn(),
    };
    // do the mock
    jest.mock('../models/Course', () => {
      return {
        ...mockList,
      };
    });
    const Course = require('../models/Course');
    // add mock resetter
    Course.resetAllMocks = function () {
      for (const mockName of Object.keys(mockList)) {
        Course[mockName].mockReset();
        Course[mockName].mockResolvedValue(null);
      }
    };
    return Course;
  },

  // Term mocker
  Term: () => {
    // mock list
    const mockList = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      deleteTerm: jest.fn(),
      addTerm: jest.fn(),
      edit: jest.fn(),
      count: jest.fn(),
    };
    // do the mock
    jest.mock('../models/Term', () => {
      return {
        ...mockList,
      };
    });
    // add mock resetter
    const Term = require('../models/Term');
    Term.resetAllMocks = function () {
      for (const mockName of Object.keys(mockList)) {
        Term[mockName].mockReset();
        Term[mockName].mockResolvedValue(null);
      }
    };
    return Term;
  },
  // Program mocker
  Program: () => {
    const mockList = {
      findOne: jest.fn(),
      findAll: jest.fn(),
    };
    // do the mock
    jest.mock('../models/Program', () => {
      return {
        ...mockList,
      };
    });
    // add mock resetter
    const Program = require('../models/Program');
    Program.resetAllMocks = function () {
      for (const mockName of Object.keys(mockList)) {
        Program[mockName].mockReset();
        Program[mockName].mockResolvedValue(null);
      }
    };
    return Program;
  },
};
