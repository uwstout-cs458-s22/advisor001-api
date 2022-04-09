const modelMocks = require('./tests_models');

global.jest = {
  // Initialize Models, environment
  init: (initModels = true) => {
    // models
    if (initModels)
      for (const mockName of Object.keys(modelMocks)) {
        global.jest[mockName] = modelMocks[mockName]();
      }
    // environment
    jest.mock('../services/environment', () => {
      return {
        port: 3000,
        stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
        stytchSecret: 'secret-test-111111111111',
        masterAdminEmail: 'master@gmail.com',
      };
    });
    // disable logging
    const log = require('loglevel');
    beforeAll(() => {
      log.disableAll();
    });
    // log, env
    global.jest.log = log;
    global.jest.env = require('../services/environment');
  },

  // Initialize auth, app
  init_routes: () => {
    // mock auth
    jest.mock('../services/auth', () => {
      const { setClearanceLevel } = jest.requireActual('../services/auth');

      return {
        // default login is an unprivileged user
        authorizeSession: jest.fn().mockImplementation((req, res, next) => {
          const { sampleStytchAuthenticationInfo, dataForGetUser } = global.jest;
          req.stytchAuthenticationInfo = sampleStytchAuthenticationInfo(dataForGetUser(1)[0]);
          return next();
        }),
        setClearanceLevel,
      };
    });
    // use real clearance checker, custom login helper
    // loginAs will take user data as input & set up mocks appropriately
    global.jest.auth = require('../services/auth');
    global.jest.auth.loginAs = function (user, dbUser) {
      // resolve db user
      global.jest.User.findOne.mockResolvedValueOnce(dbUser !== undefined ? dbUser : user);
      // resolve stytch data
      global.jest.auth.authorizeSession.mockImplementationOnce((req, res, next) => {
        req.stytchAuthenticationInfo = global.jest.sampleStytchAuthenticationInfo(
          user.userId,
          user.email
        );
        return next();
      });
    };
    // more testing essentials
    global.jest.request = require('supertest');
    global.jest.app = require('../app')();
  },

  // Init for tests using db.query
  init_db: () => {
    jest.mock('../services/database.js', () => {
      return {
        db: {
          query: jest.fn(),
        },
      };
    });
    global.jest.db = require('../services/database').db;
  },

  // --- miscellaneous helper functions ---

  // a helper that creates an array structure for getCourseById
  dataForGetCourse: function (rows, offset = 0) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const value = i + offset;
      data.push({
        id: `${value}`,
        prefix: 'DEP',
        suffix: `${100 + i}`,
        title: 'Introduction to Whatever',
        description: 'Department consent required',
        credits: 3,
      });
    }
    return data;
  },
  // a helper that creates an array structure for getProgramById
  dataForGetProgram: function (rows, offset = 0) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const value = i + offset;
      data.push({
        id: `${value}`,
        title: `Program-${value}`,
        description: `Program description goes here`,
      });
    }
    return data;
  },
  // a helper that creates an array structure for getTermById
  dataForGetTerm: function (rows, offset = 0) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const value = i + offset;
      data.push({
        id: `${value}`,
        title: 'FALL-2022',
        startyear: 2022,
        semester: 2,
      });
    }
    return data;
  },
  // a helper that creates an array structure for getUserById
  dataForGetUser: function (rows, offset = 0) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const value = i + offset;
      data.push({
        id: `${value}`,
        email: `email${value}@uwstout.edu`,
        userId: `user-test-someguid${value}`,
        enable: 'false',
        role: 'user',
      });
    }
    return data;
  },
  // a helper that returns sample auth data -- taken directly from the Stytch API reference
  sampleStytchAuthenticationInfo: function (userId, email) {
    return {
      status_code: 200,
      request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
      session: {
        attributes: {
          ip_address: '203.0.113.1',
          user_agent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
        },
        authentication_factors: [
          {
            delivery_method: 'email',
            email_factor: {
              email_address: `${email}`,
              email_id: 'email-test-81bf03a8-86e1-4d95-bd44-bb3495224953',
            },
            last_authenticated_at: '2021-08-09T07:41:52Z',
            type: 'magic_link',
          },
        ],
        expires_at: '2021-08-10T07:41:52Z',
        last_accessed_at: '2021-08-09T07:41:52Z',
        session_id: 'session-test-fe6c042b-6286-479f-8a4f-b046a6c46509',
        started_at: '2021-08-09T07:41:52Z',
        user_id: `${userId}`,
      },
      session_token: 'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
    };
  },
  // a helper that returns one admin user row
  samplePrivilegedUser: function () {
    return {
      id: '0',
      email: 'sandbox@stytch.com',
      userId: 'user-test-16d9ba61-97a1-4ba4-9720-b03761dc50c6',
      enable: 'true',
      role: 'admin',
    };
  },
};
