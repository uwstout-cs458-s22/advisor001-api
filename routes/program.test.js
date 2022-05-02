// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const {
  Program,
  User,
  app,
  request,
  dataForGetProgram,
  dataForGetUser,
  samplePrivilegedUser,
  auth,
} = global.jest;

describe('GET /program', () => {
  beforeEach(Program.resetAllMocks);

  // helper functions - id is a numeric value
  async function callGetOnProgramRoute(row, key = 'id') {
    const id = row[key];
    Program.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/program/${id}`);
    return response;
  }

  describe('given a row id', () => {
    test('should make a call to Program.findOne', async () => {
      const row = dataForGetProgram(1)[0];
      await callGetOnProgramRoute(row);
      expect(Program.findOne.mock.calls).toHaveLength(1);
      expect(Program.findOne.mock.calls[0]).toHaveLength(1);
      expect(Program.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containing the program data', async () => {
      const data = dataForGetProgram(10);
      for (const row of data) {
        const { body: program } = await callGetOnProgramRoute(row);

        for (const key in Object.keys(row)) {
          expect(program).toHaveProperty(key, row[key]);
        }
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetProgram(1, 100);
      const response = await callGetOnProgramRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when program exists', async () => {
      const data = dataForGetProgram(1, 100);
      const response = await callGetOnProgramRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when program does NOT exists', async () => {
      Program.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/program/100`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Program.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/program/100`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('querying a group of programs', () => {
    test('should make a call to Program.findAll', async () => {
      const data = dataForGetProgram(10);
      Program.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/program`);
      expect(Program.findAll.mock.calls).toHaveLength(1);
      expect(Program.findAll.mock.calls[0]).toHaveLength(3);
      expect(Program.findAll.mock.calls[0][0]).toBeNull();
      expect(Program.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Program.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetProgram(3);
      Program.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/program?limit=3`);
      expect(Program.findAll.mock.calls).toHaveLength(1);
      expect(Program.findAll.mock.calls[0]).toHaveLength(3);
      expect(Program.findAll.mock.calls[0][0]).toBeNull();
      expect(Program.findAll.mock.calls[0][1]).toBe('3');
      expect(Program.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetProgram(3);
      Program.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/program?offset=1`);
      expect(Program.findAll.mock.calls).toHaveLength(1);
      expect(Program.findAll.mock.calls[0]).toHaveLength(3);
      expect(Program.findAll.mock.calls[0][0]).toBeNull();
      expect(Program.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Program.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetProgram(3, 1);
      Program.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/program?limit=3&offset=1`);
      expect(Program.findAll.mock.calls).toHaveLength(1);
      expect(Program.findAll.mock.calls[0]).toHaveLength(3);
      expect(Program.findAll.mock.calls[0][0]).toBeNull();
      expect(Program.findAll.mock.calls[0][1]).toBe('3');
      expect(Program.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should respond with a json array object containg the program data', async () => {
      const data = dataForGetProgram(5);
      Program.findAll.mockResolvedValueOnce(data);
      const { body: programs } = await request(app).get(`/program`);
      expect(programs).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(programs[i].id).toBe(data[i].id);
        expect(programs[i].prefix).toBe(data[i].prefix);
        expect(programs[i].suffix).toBe(data[i].suffix);
        expect(programs[i].title).toBe(data[i].title);
        expect(programs[i].description).toBe(data[i].description);
        expect(programs[i].credits).toBe(data[i].credits);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      Program.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/program`);
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      Program.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/program`);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when program data returned', async () => {
      const data = dataForGetProgram(5);
      Program.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get(`/program`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Program.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get(`/program`);
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});

describe('POST /program', () => {
  beforeEach(Program.resetAllMocks);
  beforeEach(() => auth.loginAs(samplePrivilegedUser()));

  describe('given program details', () => {
    test('should call both Program.findOne and Program.create', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce({});
      Program.addProgram.mockResolvedValueOnce(row);

      // Test
      await request(app).post('/program').send(requestParams);

      // Check
      expect(Program.findOne.mock.calls).toHaveLength(1);
      expect(Program.findOne.mock.calls[0]).toHaveLength(1);
      expect(Program.addProgram.mock.calls).toHaveLength(1);
      expect(Program.addProgram.mock.calls[0]).toHaveLength(1);
      for (const key in Object.keys(requestParams)) {
        // Check that the values from the post are the same as from the mocked findOne and addProgram
        expect(Program.addProgram.mock.calls[0][0]).toHaveProperty(key, requestParams[key]);
        expect(Program.findOne.mock.calls[0][0]).toHaveProperty(key, requestParams[key]);
      }
    });

    test('should respond with a json object containg the program details', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce({});
      Program.addProgram.mockResolvedValueOnce(row);

      // Test
      const { body: program } = await request(app).post('/program').send(requestParams);

      // Check
      expect(program.title).toBe(row.title);
      expect(program.description).toBe(row.description);
    });

    test('should specify json in the content type header', async () => {
      // Set-up
      const data = dataForGetProgram(1);
      const row = data[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce({});
      Program.addProgram.mockResolvedValueOnce(row);

      // Test
      const response = await request(app).post('/program').send(requestParams);

      // Check
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when program is succesfully created', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce({});
      Program.addProgram.mockResolvedValueOnce(row);

      // Test
      const response = await request(app).post('/program').send(requestParams);

      // Check
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when program already exists exist', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce(row);
      Program.addProgram.mockResolvedValueOnce(row);

      // Test
      const response = await request(app).post('/program').send(requestParams);

      // Check
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when an Program.create error occurs', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce({});
      Program.addProgram.mockResolvedValueOnce(null);

      // Test
      const response = await request(app).post('/program').send(requestParams);

      // Check
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when create database error occurs', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.addProgram.mockRejectedValueOnce(new Error('some database error'));

      // Test
      const response = await request(app).post('/program').send(requestParams);

      // Check
      expect(response.statusCode).toBe(500);
    });
  });

  describe('given empty dictionary', () => {
    test('should respond with a 400 status code', async () => {
      // Test
      const response = await request(app).post('/program').send({});

      // Check
      expect(response.statusCode).toBe(400);
    });
  });

  describe('given empty string', () => {
    test('should respond with a 400 status code', async () => {
      // Test
      const response = await request(app).post('/program').send('');

      // Check
      expect(response.statusCode).toBe(400);
    });
  });
});

describe('DELETE /program', () => {
  beforeEach(Program.resetAllMocks);
  beforeEach(User.resetAllMocks);

  // Calls the delete program function
  async function callDeleteOnProgramRoute(row, key = 'id') {
    const id = row[key] === undefined ? '' : row[key];
    Program.findOne.mockResolvedValueOnce(row);
    const response = await request(app).delete(`/program/${id}`);
    return response;
  }

  describe('given an empty URL bar', () => {
    test('should respond with a 400 status code when passing empty string', async () => {
      // Set-up
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);

      // Execute
      const response = await callDeleteOnProgramRoute({});

      // Check
      expect(Program.deleteProgram).not.toBeCalled();
      expect(response.statusCode).toBe(400);
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should respond with a 200 status code when program exists and is deleted', async () => {
      // Set-up
      const program = dataForGetProgram(1, 100)[0];
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);

      // Execute
      const response = await callDeleteOnProgramRoute(program);

      // Check program
      expect(Program.findOne.mock.calls).toHaveLength(1);
      expect(Program.findOne.mock.calls[0]).toHaveLength(1);
      expect(Program.findOne.mock.calls[0][0]).toHaveProperty('id', program.id);

      // Check delete
      expect(Program.deleteProgram).toBeCalled();
      expect(Program.deleteProgram.mock.calls).toHaveLength(1);
      expect(Program.deleteProgram.mock.calls[0]).toHaveLength(1);
      expect(Program.deleteProgram.mock.calls[0][0]).toBe(program.id);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when program does NOT exists', async () => {
      // Set-up
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);
      Program.findOne.mockResolvedValueOnce({});

      // Execute
      const response = await request(app).delete(`/program/100`);

      // Check program
      expect(Program.findOne.mock.calls[0]).toHaveLength(1);
      expect(Program.findOne.mock.calls[0][0]).toHaveProperty('id', '100');

      // Check delete
      expect(Program.deleteProgram).not.toBeCalled();
      expect(response.statusCode).toBe(500);
    });

    test('should respond with 500 when the deleter is not found', async () => {
      // Set-up
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter, {}); // NO EDITOR (2nd param is database-resolved user)
      const program = dataForGetProgram(1, 100)[0];

      // Execute
      const response = await callDeleteOnProgramRoute(program);

      // Check deleter
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      // Check delete
      expect(Program.deleteProgram).not.toBeCalled();
      expect(response.statusCode).toBe(500);
    });

    test('should respond with 401 when the editor is not authorized', async () => {
      // Set-up
      const deleter = dataForGetUser(1, 100)[0];
      deleter.enable = 'true';
      auth.loginAs(deleter);
      const program = dataForGetProgram(1, 100)[0];

      // Execute
      const response = await callDeleteOnProgramRoute(program);

      // Check deleter
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', deleter.userId);

      // Check delete
      expect(User.deleteUser).not.toBeCalled();
      expect(response.statusCode).toBe(401);
    });
  });
});
