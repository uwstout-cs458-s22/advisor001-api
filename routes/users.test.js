// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { User, auth, app, request, dataForGetUser, samplePrivilegedUser } = global.jest;

/*
Custom extensions defined in test_models
- User.resetAllMocks()
- auth.loginAs(user, [dbUser - optional])
*/

describe('GET /users', () => {
  beforeEach(User.resetAllMocks);

  // helper functions - id is a numeric value
  async function callGetOnUserRoute(row, key = 'id') {
    const id = row[key];
    User.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/users/${id}`);
    return response;
  }

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
        // expect all keys to match
        for (const key of Object.keys(user)) {
          expect(user[key]).toBe(row[key]);
        }
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

  beforeEach(User.resetAllMocks);

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

      auth.loginAs(editor);

      User.findOne.mockResolvedValueOnce(user);
      User.edit.mockResolvedValue({});

      const response = await callPutOnUserRoute('', desiredChanges); // NO USER ID

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Required Parameters Missing');
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should 500 when editor is not found in database', async () => {
      const editor = samplePrivilegedUser();
      const user = dataForGetUser(1)[0];

      const desiredChanges = {
        role: 'admin',
        enable: 'true',
      };

      auth.loginAs(editor, {}); // NO EDITOR (2nd param is database-resolved user)

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

      auth.loginAs(editor);

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

      auth.loginAs(editor);

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

      auth.loginAs(editor);

      User.findOne.mockResolvedValueOnce(user);

      const expectedReturn = Object.assign(user, desiredChanges);
      User.edit.mockResolvedValueOnce(expectedReturn);

      const response = await callPutOnUserRoute(user.userId, desiredChanges);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expectedReturn);
    });

    test('should still work even if no body parameters are specified', async () => {
      const editor = samplePrivilegedUser();
      const user = dataForGetUser(1)[0];

      const desiredChanges = {};

      auth.loginAs(editor);

      User.findOne.mockResolvedValueOnce(user);
      User.edit.mockResolvedValueOnce(user);

      const response = await callPutOnUserRoute(user.userId, desiredChanges);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(user);
    });
  });
});

describe('POST /users', () => {
  beforeEach(User.resetAllMocks);

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
  beforeEach(User.resetAllMocks);

  async function callDeleteOnUserRoute(row, key = 'userId') {
    const id = row[key] === undefined ? '' : row[key];
    User.findOne.mockResolvedValueOnce(row);
    const response = await request(app).delete(`/users/${id}`);
    return response;
  }

  describe('given an empty URL bar', () => {
    test('should respond with a 400 status code when passing empty string', async () => {
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);
      const response = await callDeleteOnUserRoute({});

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      expect(User.deleteUser).not.toBeCalled();

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Required Parameters Missing');
    });

    test('should respond with a 401 status code when empty string and not authorized', async () => {
      const deleter = dataForGetUser(1, 100)[0];
      deleter.enable = 'true';
      auth.loginAs(deleter);
      const response = await callDeleteOnUserRoute({});

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);
      expect(User.deleteUser).not.toBeCalled();

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You are not allowed to do that!');
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should respond with a 200 status code when user exists and is deleted', async () => {
      const user = dataForGetUser(1, 100)[0];
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);
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
      auth.loginAs(deleter);

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

    test('should 500 when editor is not found in database', async () => {
      const deleter = samplePrivilegedUser();
      const user = dataForGetUser(1, 100)[0];
      auth.loginAs(deleter, {}); // NO EDITOR (2nd param is database-resolved user)
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
      auth.loginAs(deleter);
      const response = await callDeleteOnUserRoute(user);

      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      expect(User.deleteUser).not.toBeCalled();
      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You are not allowed to do that!');
    });
  });
});
