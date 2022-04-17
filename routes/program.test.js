// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { Program, app, request, dataForGetProgram } = global.jest;

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
  
      test('should respond with a 400 status code with missing data', async () => {
        Program.findAll.mockResolvedValueOnce([]);
        const response = await request(app).get(`/program`);
        expect(response.statusCode).toBe(400);
      });
  
      test('should respond with a 500 status code when an error occurs', async () => {
        Program.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
        const response = await request(app).get(`/program`);
        expect(response.statusCode).toBe(500);
        expect(response.body.error.message).toBe('Some Database Failure');
      });
    });
  });