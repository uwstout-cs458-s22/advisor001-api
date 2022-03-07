const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const User = require('../models/User');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/User', () => {
  const { hasMinimumPermission } = jest.requireActual('../models/User');

  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    edit: jest.fn(),
    hasMinimumPermission,
    deleteUser: jest.fn(),
  };
});

jest.mock('../services/environment', () => {
  return {
    port: 3001,
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    masterAdminEmail: 'master@gmail.com',
  };
});

jest.mock('../services/auth', () => {
  const { setClearanceLevel } = jest.requireActual('../services/auth');

  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      return next();
    }),
    setClearanceLevel,
  };
});

const auth = require('../services/auth');

// a helper that creates an array structure for getUserById
function dataForGetUser(rows, offset = 0) {
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
}

// a helper that returns one admin user row
function samplePrivilegedUser() {
  return {
    id: '0',
    email: 'sandbox@stytch.com',
    userId: 'user-test-16d9ba61-97a1-4ba4-9720-b03761dc50c6',
    enable: 'true',
    role: 'admin',
  };
}

// a helper that returns sample auth data -- taken directly from the Stytch API reference
function sampleStytchAuthenticationInfo(userId, email) {
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
}

describe('GET /users', () => {
  beforeEach(() => {
    User.create.mockReset();
    User.create.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.findAll.mockReset();
    User.findAll.mockResolvedValue(null);
  });

  // helper functions - id is a numeric value
  async function callGetOnUserRoute(row, key = 'id') {
    const id = row[key];
    User.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/users/${id}`);
    return response;
  }
  // helper functions - userId is a text value

  describe('given a row id', () => {
    test('should make a call to User.findOne', async () => {
      const row = dataForGetUser(1)[0];
      await callGetOnUserRoute(row);
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containg the user data', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        const { body: user } = await callGetOnUserRoute(row);
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.enable).toBe(row.enable);
        expect(user.role).toBe(row.role);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user exists', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when user does NOT exists', async () => {
      User.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/users/100`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/users/100`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('given a userId (from Stytch)', () => {
    test('should make a call to User.findOne', async () => {
      const row = dataForGetUser(1)[0];
      await callGetOnUserRoute(row, 'userId');
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', row.userId);
    });

    test('should respond with a json object containg the user data', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        const { body: user } = await callGetOnUserRoute(row, 'userId');
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.enable).toBe(row.enable);
        expect(user.role).toBe(row.role);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0], 'userId');
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user exists', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0], 'userId');
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when user does NOT exists', async () => {
      User.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/users/user-test-someguid`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/users/user-test-someguid`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('querying a group of users', () => {
    test('should make a call to User.findAll', async () => {
      const data = dataForGetUser(10);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBeUndefined();
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetUser(3);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users?limit=3`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBe('3');
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetUser(3);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users?offset=1`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBeUndefined();
      expect(User.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users?limit=3&offset=1`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBe('3');
      expect(User.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should respond with a json array object containg the user data', async () => {
      const data = dataForGetUser(5);
      User.findAll.mockResolvedValueOnce(data);
      const { body: users } = await request(app).get(`/users`);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(users[i].id).toBe(data[i].id);
        expect(users[i].email).toBe(data[i].email);
        expect(users[i].userId).toBe(data[i].userId);
        expect(users[i].enable).toBe(data[i].enable);
        expect(users[i].role).toBe(data[i].role);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/users`);
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/users`);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user data returned', async () => {
      const data = dataForGetUser(5);
      User.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get(`/users`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when user data returned (even no users)', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/users`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get(`/users`);
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});

describe('PUT /users', () => {
  // TODO please make sure these tests meet the user acceptance criteria

  beforeEach(() => {
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.findAll.mockReset();
    User.findAll.mockResolvedValue(null);
    User.edit.mockReset();
    User.edit.mockResolvedValue(null);
  });

  // helper for matching the header to the user passed
  function resolveAuthToMatchUser(user) {
    auth.authorizeSession.mockImplementationOnce((req, res, next) => {
      req.stytchAuthenticationInfo = sampleStytchAuthenticationInfo(user.userId, user.email);
      return next();
    });
  }

  // put helper
  async function callPutOnUserRoute(userId, body) {
    const response = await request(app).put(`/users/${userId}`).send(body);
    return response;
  }

  describe('given an empty URL bar', () => {
    test('should result in 400', async () => {
      const editor = samplePrivilegedUser();
      const user = dataForGetUser(1)[0];

      const desiredChanges = {
        role: 'admin',
        enable: 'true',
      };

      resolveAuthToMatchUser(editor);

      User.findOne.mockResolvedValueOnce(editor);
      User.findOne.mockResolvedValueOnce(user);
      User.edit.mockResolvedValue({});

      const response = await callPutOnUserRoute('', desiredChanges); // NO USER ID

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Required Parameters Missing');
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should 500 when editor is not found', async () => {
      const editor = samplePrivilegedUser();
      const user = dataForGetUser(1)[0];

      const desiredChanges = {
        role: 'admin',
        enable: 'true',
      };

      resolveAuthToMatchUser(editor);

      User.findOne.mockResolvedValueOnce({}); // NO EDITOR
      User.findOne.mockResolvedValueOnce(user);
      User.edit.mockResolvedValueOnce(Object.assign(user, desiredChanges));

      const response = await callPutOnUserRoute(user.userId, desiredChanges);

      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Your account is not found in the database!');
    });

    test('should 401 when not authorized to edit users', async () => {
      const rows = dataForGetUser(2, 100);
      const editor = rows[0]; // UNPRIVILEGED USER
      const user = rows[1];
      editor.enable = 'true';

      const desiredChanges = {
        role: 'admin',
        enable: 'true',
      };

      resolveAuthToMatchUser(editor);

      User.findOne.mockResolvedValueOnce(editor);
      User.findOne.mockResolvedValueOnce(user);
      User.edit.mockResolvedValueOnce({});

      const response = await callPutOnUserRoute(user.userId, desiredChanges);

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You are not allowed to do that!');
    });

    test('should 404 when the user is not found', async () => {
      const editor = samplePrivilegedUser();

      const desiredChanges = {
        role: 'admin',
        enable: 'true',
      };

      resolveAuthToMatchUser(editor);

      User.findOne.mockResolvedValueOnce(editor);
      User.findOne.mockResolvedValueOnce({}); // NO USER
      User.edit.mockResolvedValueOnce({});

      const response = await callPutOnUserRoute('user-test-someguid1', desiredChanges);
      expect(response.statusCode).toBe(404);
      expect(response.body.error.message).toBe('Not Found');
    });

    test('should respond 200 and successfully return edited version of user', async () => {
      const editor = samplePrivilegedUser();
      const user = dataForGetUser(1)[0];

      const desiredChanges = {
        role: 'admin',
        enable: 'true',
      };

      resolveAuthToMatchUser(editor);

      User.findOne.mockResolvedValueOnce(editor);
      User.findOne.mockResolvedValueOnce(user);

      const expectedReturn = Object.assign(user, desiredChanges);
      User.edit.mockResolvedValueOnce(expectedReturn);

      const response = await callPutOnUserRoute(user.userId, desiredChanges);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expectedReturn);
    });
  });
});

describe('POST /users', () => {
  beforeEach(() => {
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.create.mockReset();
    User.create.mockResolvedValue(null);
  });

  describe('given a email and userId (stytch_id)', () => {
    test('should call both User.findOne and User.create', async () => {
      const data = dataForGetUser(3);
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const requestParms = {
          userId: row.userId,
          email: row.email,
        };
        User.findOne.mockResolvedValueOnce({});
        User.create.mockResolvedValueOnce(row);
        await request(app).post('/users').send(requestParms);
        expect(User.findOne.mock.calls).toHaveLength(i + 1);
        expect(User.findOne.mock.calls[i]).toHaveLength(1);
        expect(User.findOne.mock.calls[i][0]).toHaveProperty('userId', row.userId);
        expect(User.create.mock.calls).toHaveLength(i + 1);
        expect(User.create.mock.calls[i]).toHaveLength(2);
        expect(User.create.mock.calls[i][0]).toBe(row.userId);
        expect(User.create.mock.calls[i][1]).toBe(row.email);
      }
    });

    test('should respond with a json object containg the user id', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        User.findOne.mockResolvedValueOnce({});
        User.create.mockResolvedValueOnce(row);
        const requestParms = {
          userId: row.userId,
          email: row.email,
        };
        const { body: user } = await request(app).post('/users').send(requestParms);
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.role).toBe(row.role);
        expect(user.enable).toBe(row.enable);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      User.findOne.mockResolvedValueOnce({});
      User.create.mockResolvedValueOnce(row);
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      const response = await request(app).post('/users').send(requestParms);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test("should respond with a 201 status code when user doesn't exist", async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      User.findOne.mockResolvedValueOnce({});
      User.create.mockResolvedValueOnce(row);
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(201);
    });

    test('should respond with a 200 status code when user already exists exist', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce(row);
      User.create.mockResolvedValueOnce(row);
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an User.create error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce({});
      User.create.mockResolvedValueOnce(null);
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when an User.findOne error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce(null);
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when findOne database error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockRejectedValueOnce(new Error('some database error'));
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when create database error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce({});
      User.create.mockRejectedValueOnce(new Error('some database error'));
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 400 status code when missing required userId', async () => {
      const response = await request(app).post('/users').send({ email: 'email1@uwstout.edu' });
      expect(response.statusCode).toBe(400);
    });

    test('should respond with a 400 status code when missing required email', async () => {
      const response = await request(app).post('/users').send({ userId: 'user-test-someguid1' });
      expect(response.statusCode).toBe(400);
    });

    test('should respond with a 400 status code when passing empty dictionary', async () => {
      const response = await request(app).post('/users').send({});
      expect(response.statusCode).toBe(400);
    });

    test('should respond with a 400 status code when passing empty string', async () => {
      const response = await request(app).post('/users').send('');
      expect(response.statusCode).toBe(400);
    });
  });
});

describe('DELETE /users', () => {
  beforeEach(() => {
    User.create.mockReset();
    User.create.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.deleteUser.mockReset();
    User.deleteUser.mockResolvedValue(null);
  });

  async function callDeleteOnUserRoute(row, key = 'userId') {
    const id = row[key] === undefined ? '' : row[key];
    User.findOne.mockResolvedValueOnce(row);
    const response = await request(app).delete(`/users/${id}`);
    return response;
  }

  // helper for matching the header to the user passed
  function resolveAuthToMatchUser(user) {
    auth.authorizeSession.mockImplementationOnce((req, res, next) => {
      req.stytchAuthenticationInfo = sampleStytchAuthenticationInfo(user.userId, user.email);
      return next();
    });
  }

  describe('given an empty URL bar', () => {
    test('should respond with a 400 status code when passing empty string', async () => {
      const deleter = samplePrivilegedUser();
      resolveAuthToMatchUser(deleter);
      User.findOne.mockResolvedValueOnce(deleter);
      const response = await callDeleteOnUserRoute({});

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      expect(User.deleteUser).not.toBeCalled();

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Bad Parameters');
    });

    test('should respond with a 401 status code when empty string and not authorized', async () => {
      const deleter = dataForGetUser(1, 100)[0];
      deleter.enable = 'true';
      resolveAuthToMatchUser(deleter);
      User.findOne.mockResolvedValueOnce(deleter);
      const response = await callDeleteOnUserRoute({});

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);
      expect(User.deleteUser).not.toBeCalled();

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You do not have permission to delete!');
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should respond with a 200 status code when user exists and is deleted', async () => {
      const user = dataForGetUser(1, 100)[0];
      const deleter = samplePrivilegedUser();
      resolveAuthToMatchUser(deleter);
      User.findOne.mockResolvedValueOnce(deleter);
      const response = await callDeleteOnUserRoute(user);

      expect(User.findOne.mock.calls).toHaveLength(2);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);
      expect(User.findOne.mock.calls[1]).toHaveLength(1);
      expect(User.findOne.mock.calls[1][0]).toHaveProperty('userId', user.userId);

      expect(User.deleteUser).toBeCalled();
      expect(User.deleteUser.mock.calls).toHaveLength(1);
      expect(User.deleteUser.mock.calls[0]).toHaveLength(1);
      expect(User.deleteUser.mock.calls[0][0]).toBe(user.userId);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when user does NOT exists', async () => {
      const deleter = samplePrivilegedUser();
      resolveAuthToMatchUser(deleter);
      User.findOne.mockResolvedValueOnce(deleter);

      User.findOne.mockResolvedValueOnce({});
      const response = await request(app).delete(`/users/100`);

      expect(User.findOne.mock.calls).toHaveLength(2);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);
      expect(User.findOne.mock.calls[1]).toHaveLength(1);
      expect(User.findOne.mock.calls[1][0]).toHaveProperty('userId', '100');
      expect(User.deleteUser).not.toBeCalled();

      expect(response.statusCode).toBe(404);
    });

    test('should respond with 500 when the editor is not found', async () => {
      const deleter = samplePrivilegedUser();
      const user = dataForGetUser(1, 100)[0];
      resolveAuthToMatchUser(deleter);
      User.findOne.mockResolvedValueOnce({});
      const response = await callDeleteOnUserRoute(user);

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);
      expect(User.deleteUser).not.toBeCalled();

      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Your account is not found in the database!');
    });

    test('should respond with 401 when the editor is not authorized', async () => {
      const rows = dataForGetUser(2, 100);
      const deleter = rows[0];
      const user = rows[1];
      deleter.enable = 'true';
      resolveAuthToMatchUser(deleter);
      User.findOne.mockResolvedValueOnce(deleter);
      const response = await callDeleteOnUserRoute(user);

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      expect(User.deleteUser).not.toBeCalled();
      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You do not have permission to delete!');
    });
  });
});
