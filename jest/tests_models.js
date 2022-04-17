module.exports = {
  // User mocker
  User: () => {
    // do the mock
    jest.mock('../models/User', () => {
      const { hasMinimumPermission } = jest.requireActual('../models/User');
      return {
        findOne: jest.fn().mockImplementation((criteria) => {
          return Object.assign(criteria, global.jest.dataForGetUser(1)[0]);
        }),
        findAll: jest.fn(),
        create: jest.fn(),
        edit: jest.fn(),
        hasMinimumPermission,
        deleteUser: jest.fn(),
        count: jest.fn(),
      };
    });

    // add mock resetter
    const User = require('../models/User');
    User.resetAllMocks = function () {
      for (const mockName of ['findOne', 'findAll', 'create', 'edit', 'deleteUser', 'count']) {
        User[mockName].mockReset();
        User[mockName].mockResolvedValue(null);
      }
    };
    return User;
  },
  // Course mocker
  Course: () => {
    // do the mock
    jest.mock('../models/Course', () => {
      return {
        findOne: jest.fn(),
        findAll: jest.fn(),
        deleteCourse: jest.fn(),
        edit: jest.fn(),
        count: jest.fn(),
      };
    });
    // add mock resetter
    const Course = require('../models/Course');
    Course.resetAllMocks = function () {
      for (const mockName of ['findOne', 'findAll', 'deleteCourse', 'edit', 'count']) {
        Course[mockName].mockReset();
        Course[mockName].mockResolvedValue(null);
      }
    };
    return Course;
  },
  // Term mocker
  Term: () => {
    // do the mock
    jest.mock('../models/Term', () => {
      return {
        findOne: jest.fn(),
        findAll: jest.fn(),
        count: jest.fn(),
      };
    });
    // add mock resetter
    const Term = require('../models/Term');
    Term.resetAllMocks = function () {
      for (const mockName of ['findOne', 'findAll', 'count']) {
        Term[mockName].mockReset();
        Term[mockName].mockResolvedValue(null);
      }
    };
    return Term;
  },
  // Program mocker
  Program: () => {
    // do the mock
    jest.mock('../models/Program', () => {
      return {
        findOne: jest.fn(),
        findAll: jest.fn(),
      };
    });
    // add mock resetter
    const Program = require('../models/Program');
    Program.resetAllMocks = function () {
      for (const mockName of ['findOne', 'findAll']) {
        Program[mockName].mockReset();
        Program[mockName].mockResolvedValue(null);
      }
    };
    return Program;
  },
};
