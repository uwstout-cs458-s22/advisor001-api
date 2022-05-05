// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const {
  Program,
  ProgramCourse,
  User,
  app,
  auth,
  request,
  dataForGetUser,
  dataForGetProgram,
  dataForGetCourse,
  samplePrivilegedUser,
} = global.jest;

const HttpError = require('http-errors');

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

  describe('PUT /Program', () => {
    // TODO double check acceptance criteria
    beforeEach(Program.resetAllMocks);

    // put helper
    function callPutOnProgramRoute(ProgramId, body) {
      return request(app).put(`/program/${ProgramId}`).send(body);
    }

    describe('given an empty URL bar', () => {
      test('should result in 400', async () => {
        const editor = samplePrivilegedUser();
        auth.loginAs(editor);

        Program.findOne.mockResolvedValueOnce({});
        const response = await callPutOnProgramRoute('', {}); // NO Program ID

        expect(Program.findOne).not.toBeCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body.error.message).toBe('Required Parameters Missing');
      });
    });

    describe('when URL bar is non-empty', () => {
      test('should 500 when editor is not found', async () => {
        const editor = samplePrivilegedUser();
        auth.loginAs(editor, {}); // NO EDITOR IN DB

        const program = dataForGetProgram(1)[0];

        const desiredChanges = {
          description: 'This',
          title: 'CS',
        };

        Program.findOne.mockResolvedValueOnce(program);
        Program.edit.mockResolvedValueOnce(Object.assign(program, desiredChanges));

        const response = await callPutOnProgramRoute(program.id, desiredChanges);

        expect(Program.findOne).not.toBeCalled();
        expect(Program.edit).not.toBeCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body.error.message).toBe('Your account is not found in the database!');
      });

      test('should 401 when not authorized to edit Programs', async () => {
        const editor = dataForGetUser(1)[0];
        editor.enable = 'true';
        auth.loginAs(editor); // Unprivileged editor

        const program = dataForGetProgram(1)[0];

        const desiredChanges = {
          description: 'This',
          title: 'CS',
        };

        Program.findOne.mockResolvedValueOnce(program);
        Program.edit.mockResolvedValueOnce(Object.assign(program, desiredChanges));

        const response = await callPutOnProgramRoute(program.id, desiredChanges);

        expect(response.statusCode).toBe(401);
        expect(response.body.error.message).toBe('You are not allowed to do that!');
      });

      test('should 404 when the Program is not found', async () => {
        const editor = samplePrivilegedUser();
        auth.loginAs(editor);

        const desiredChanges = {
          description: 'This',
          title: 'CS',
        };
        Program.findOne.mockResolvedValueOnce({}); // NO Program
        Program.edit.mockResolvedValueOnce({});

        const response = await callPutOnProgramRoute(1, desiredChanges);
        expect(response.statusCode).toBe(404);
        expect(Program.edit).not.toBeCalled();
        expect(response.body.error.message).toBe('Not Found');
      });

      test('should respond 200 and successfully return edited version of Program', async () => {
        const editor = samplePrivilegedUser();
        auth.loginAs(editor);

        const program = dataForGetProgram(1)[0];

        const desiredChanges = {
          description: 'This',
          title: 'CS',
        };
        Program.findOne.mockResolvedValueOnce(program);
        const expectedReturn = Object.assign(program, desiredChanges);
        Program.edit.mockResolvedValueOnce(desiredChanges);

        const response = await callPutOnProgramRoute(program.id, desiredChanges);

        expect(response.statusCode).toBe(200);
        // check all properties
        for (const key of Object.keys(response.body)) {
          expect(response.body).toHaveProperty(key, expectedReturn[key]);
        }
      });

      test('should still work even if no body parameters are specified', async () => {
        const editor = samplePrivilegedUser();
        auth.loginAs(editor);

        const program = dataForGetProgram(1)[0];

        const desiredChanges = {};

        Program.findOne.mockResolvedValueOnce(program);
        const expectedReturn = Object.assign(program, desiredChanges);
        Program.edit.mockResolvedValueOnce(desiredChanges);

        const response = await callPutOnProgramRoute(program.id, desiredChanges);

        expect(response.statusCode).toBe(200);
        // check all properties
        for (const key of Object.keys(response.body)) {
          expect(response.body).toHaveProperty(key, expectedReturn[key]);
        }
      });

      test("should still work if the user's role is Director", async () => {
        const editor = samplePrivilegedUser();
        editor.role = 'director';
        auth.loginAs(editor);

        const program = dataForGetProgram(1)[0];

        const desiredChanges = {
          description: 'This',
          title: 'CS',
        };

        Program.findOne.mockResolvedValueOnce(program);
        const expectedReturn = Object.assign(program, desiredChanges);
        Program.edit.mockResolvedValueOnce(desiredChanges);

        const response = await callPutOnProgramRoute(program.id, desiredChanges);

        expect(response.statusCode).toBe(200);
        // check all properties
        for (const key of Object.keys(response.body)) {
          expect(response.body).toHaveProperty(key, expectedReturn[key]);
        }
      });
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

    test('should respond with a 201 status code when program is succesfully created', async () => {
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
      expect(response.statusCode).toBe(201);
    });

    test('should respond with 409: Conflict when program exists', async () => {
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
      expect(response.statusCode).toBe(409);
      expect(Program.findOne).toBeCalled();
      expect(Program.addProgram).not.toBeCalled();
      expect(Program.findOne.mock.calls[0][0]).toHaveProperty('title', row.title);
      expect(Program.findOne.mock.calls[0][0]).toHaveProperty('description', row.description);
      expect(Program.findOne.mock.calls[0][0]).not.toHaveProperty('id');
    });

    test('should respond with a 500 status code when create database error occurs', async () => {
      // Set-up
      const row = dataForGetProgram(1)[0];
      const requestParams = {
        title: row.title,
        description: row.description,
      };
      Program.findOne.mockResolvedValueOnce({});
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

    test('should respond with a 404 status code when program does NOT exists', async () => {
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
      expect(response.statusCode).toBe(404);
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

describe('GET /program/:id/course/...', () => {
  describe('given a course id', () => {
    beforeEach(ProgramCourse.resetAllMocks);

    function makeCall(programId, courseId, mockReturn) {
      ProgramCourse.findOne.mockResolvedValueOnce(mockReturn);
      return request(app).get(`/program/${programId}/course/${courseId}`);
    }

    test('should throw 500 when a model error occurs', async () => {
      ProgramCourse.findOne.mockRejectedValueOnce(new Error('a testing error'));
      await expect(request(app).get(`/program/123/course/456`)).resolves.toHaveProperty('body', {
        error: {
          message: 'a testing error',
          status: 500,
        },
      });
    });

    test('should successfully make a call to ProgramCourse.findOne', async () => {
      const course = dataForGetCourse(1)[0];
      const program = dataForGetProgram(1)[0];
      const result = await makeCall(program.id, course.id, course);
      for (const key of Object.keys(course)) {
        expect(result.body).toHaveProperty(key, course[key]);
      }
      expect(result.statusCode).toBe(200);
      expect(ProgramCourse.findOne).toHaveBeenCalledTimes(1);
      expect(ProgramCourse.findOne.mock.calls[0]).toHaveLength(1);
      expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty('program', program.id);
      expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty('requires', course.id);
    });

    test('should simply return empty if nothing found', async () => {
      const result = await makeCall(123, 456, {});
      expect(result.statusCode).toBe(404);
      expect(result.body.error.message).toBe('Not Found');
      expect(ProgramCourse.findOne).toHaveBeenCalledTimes(1);
      expect(ProgramCourse.findOne.mock.calls[0]).toHaveLength(1);
      expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty('program', '123');
      expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty('requires', '456');
    });
  });

  describe('given NO course id', () => {
    beforeEach(ProgramCourse.resetAllMocks);

    function makeCall(programId, mockReturn) {
      ProgramCourse.findAll.mockResolvedValueOnce(mockReturn);
      return request(app).get(`/program/${programId}/course`);
    }

    test('should throw 500 when a model error occurs', async () => {
      ProgramCourse.findAll.mockRejectedValueOnce(new Error('a testing error'));
      await expect(request(app).get(`/program/123/course`)).resolves.toHaveProperty('body', {
        error: {
          message: 'a testing error',
          status: 500,
        },
      });
    });

    test('should successfully make a call to ProgramCourse.findAll', async () => {
      const program = dataForGetProgram(1)[0];
      const courses = dataForGetCourse(3);
      const result = await makeCall(program.id, courses);
      expect(result.body).toHaveLength(3);
      // make sure all courses returned
      result.body.forEach((course, index) => {
        const keys = Object.keys(course);
        expect(keys.length).toBeGreaterThan(0);
        for (const key of keys) {
          expect(courses[index]).toHaveProperty(key, course[key]);
        }
      });
      expect(result.statusCode).toBe(200);
      expect(ProgramCourse.findAll).toHaveBeenCalledTimes(1);
      expect(ProgramCourse.findAll.mock.calls[0]).toHaveLength(1);
      expect(ProgramCourse.findAll.mock.calls[0][0]).toHaveProperty('program', program.id);
    });

    test('should simply return empty if nothing found', async () => {
      const result = await makeCall(123, []);
      expect(result.statusCode).toBe(200);
      expect(result.body).toHaveLength(0);
      expect(ProgramCourse.findAll).toHaveBeenCalledTimes(1);
      expect(ProgramCourse.findAll.mock.calls[0]).toHaveLength(1);
      expect(ProgramCourse.findAll.mock.calls[0][0]).toHaveProperty('program', '123');
    });
  });

  describe('DELETE /program/:program/course/:requires', () => {
    const dummy = {
      id: '123',
      program: '456',
      requires: '789',
    };

    beforeEach(() => {
      const deleter = samplePrivilegedUser();
      auth.loginAs(deleter);
      ProgramCourse.findOne.mockResolvedValue(dummy);
      ProgramCourse.deleteProgramCourse.mockResolvedValue(true);
    });

    test('successfully deleted course', async () => {
      await expect(
        request(app).delete(`/program/${dummy.program}/course/${dummy.requires}`)
      ).resolves.toHaveProperty('statusCode', 200);
    });

    test("if it doesn't exist", async () => {
      ProgramCourse.findOne.mockResolvedValueOnce({});
      await expect(
        request(app).delete(`/program/${dummy.program}/course/${dummy.requires}`)
      ).resolves.toHaveProperty('body', {
        error: {
          status: 404,
          message: 'Not Found',
        },
      });
    });

    test('invalid parameters', async () => {
      ProgramCourse.deleteProgramCourse.mockRejectedValueOnce(
        HttpError.BadRequest('Missing Parameters')
      );
      await expect(
        request(app).delete(`/program/${dummy.program}/course/`)
      ).resolves.toHaveProperty('body', {
        error: {
          status: 400,
          message: 'Missing Parameters',
        },
      });
    });
  });
});

describe('PUT /program/:program/course/', () => {
  const dummyCourse = dataForGetCourse(1)[0];
  const dummyProgram = dataForGetProgram(1)[0];
  const dummyProgramCourse = {
    id: '1',
    program: dummyProgram.id,
    requires: dummyCourse.id,
  };

  beforeEach(() => {
    auth.loginAs(samplePrivilegedUser());
    Program.resetAllMocks();
    ProgramCourse.resetAllMocks();
  });

  test('Missing parameters', async () => {
    // Set-up
    ProgramCourse.findOne.mockResolvedValueOnce({});

    // Test
    const response = await request(app)
      .put(`/program/${dummyProgramCourse.program}/course/`)
      .send({});

    // Check
    expect(response.statusCode).toBe(400);
  });

  test('Program Course does not exist', async () => {
    // Set-up
    const newRequires = '2';
    ProgramCourse.findOne.mockResolvedValueOnce({});
    ProgramCourse.editProgramCourse.mockResolvedValue({});

    // Test
    const response = await request(app).put('/program/1/course/1/').send({ requires: newRequires });

    // Check
    expect(response.statusCode).toBe(404);
  });

  test('Succesful edit', async () => {
    // Set-up
    const newChange = { requires: '2' };
    const expectedReturn = Object.assign(dummyProgramCourse, newChange);
    ProgramCourse.findOne.mockResolvedValueOnce(dummyProgramCourse);
    ProgramCourse.editProgramCourse.mockResolvedValueOnce(
      dummyProgramCourse.id,
      newChange.requires
    );

    // Test
    const response = await request(app)
      .put(`/program/${dummyProgramCourse.program}/course/${dummyProgramCourse.requires}/`)
      .send(newChange);

    // Check
    expect(response.statusCode).toBe(200);
    for (const key of Object.keys(response.body)) {
      expect(response.body).toHaveProperty(key, expectedReturn[key]);
    }
  });
});

describe('POST /program/:program/course/', () => {
  beforeEach(ProgramCourse.resetAllMocks);
  beforeEach(() => auth.loginAs(samplePrivilegedUser()));

  const requestParams = {
    program: '123',
    requires: '456',
  };

  const doReq = () =>
    request(app).post(`/program/${requestParams.program}/course/${requestParams.requires}`).send();

  describe('given program details', () => {
    test('should call both ProgramCourse.findOne and ProgramCourse.addProgramCourse', async () => {
      // Set-up

      ProgramCourse.findOne.mockResolvedValueOnce({});
      ProgramCourse.addProgramCourse.mockResolvedValueOnce(
        Object.assign({ id: 789 }, requestParams)
      );

      // Test
      const result = await doReq();

      // Check
      expect(result.statusCode).toBe(201);
      expect(ProgramCourse.findOne).toBeCalled();
      expect(ProgramCourse.findOne.mock.calls[0]).toHaveLength(1);
      expect(ProgramCourse.addProgramCourse.mock.calls).toHaveLength(1);
      expect(ProgramCourse.addProgramCourse.mock.calls[0]).toHaveLength(1);
      for (const key in Object.keys(requestParams)) {
        // Check that the values from the post are the same as from the mocked findOne and addProgram
        expect(ProgramCourse.addProgramCourse.mock.calls[0][0]).toHaveProperty(
          key,
          requestParams[key]
        );
        expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty(key, requestParams[key]);
        expect(result.body).toHaveProperty(key, requestParams[key]);
      }
      expect(result.body).toHaveProperty('id', 789);
    });

    test('should respond with a json object containg the program details', async () => {
      // Set-up
      ProgramCourse.findOne.mockResolvedValueOnce({});
      ProgramCourse.addProgramCourse.mockResolvedValueOnce(
        Object.assign({ id: 789 }, requestParams)
      );

      // Test
      const result = await doReq();

      // Check
      expect(result.body.program).toBe(requestParams.program);
      expect(result.body.requires).toBe(requestParams.requires);
      expect(result.body.id).toBe(789);
    });

    test('should specify json in the content type header', async () => {
      // Set-up
      ProgramCourse.findOne.mockResolvedValueOnce({});
      ProgramCourse.addProgramCourse.mockResolvedValueOnce(requestParams);

      // Test
      const response = await doReq();

      // Check
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 201 status code when program is succesfully created', async () => {
      // Set-up
      ProgramCourse.findOne.mockResolvedValueOnce({});
      ProgramCourse.addProgramCourse.mockResolvedValueOnce(
        Object.assign({ id: 789 }, requestParams)
      );

      // Test
      const response = await doReq();

      // Check
      expect(response.statusCode).toBe(201);
    });

    test('should respond with 409: Conflict when program exists', async () => {
      // Set-up
      ProgramCourse.findOne.mockResolvedValueOnce(Object.assign({ id: 789 }, requestParams));
      ProgramCourse.addProgramCourse.mockResolvedValueOnce(
        Object.assign({ id: 789 }, requestParams)
      );

      // Test
      const response = await doReq();

      // Check
      expect(response.statusCode).toBe(409);
      expect(ProgramCourse.findOne).toBeCalled();
      expect(ProgramCourse.addProgramCourse).not.toBeCalled();
      expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty(
        'program',
        requestParams.program
      );
      expect(ProgramCourse.findOne.mock.calls[0][0]).toHaveProperty(
        'requires',
        requestParams.requires
      );
      expect(ProgramCourse.findOne.mock.calls[0][0]).not.toHaveProperty('id', 789);
    });

    test('should respond with a 500 status code when an ProgramCourse.create error occurs', async () => {
      ProgramCourse.findOne.mockResolvedValueOnce({});
      ProgramCourse.addProgramCourse.mockRejectedValueOnce(HttpError(500, 'a testing error'));

      // Test
      const response = await doReq();

      // Check
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('a testing error');
    });
  });

  describe('given empty dictionary', () => {
    test('should respond with a 400 status code', async () => {
      // Test
      const response = await request(app).post('/program/0/course/').send({});

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
