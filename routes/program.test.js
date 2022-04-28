// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { Program, ProgramCourse, app, request, dataForGetProgram, dataForGetCourse } = global.jest;

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
});
