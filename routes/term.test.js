// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { Term, app, request, dataForGetTerm } = global.jest;

/*
Custom extensions defined in test_models
- Term.resetAllMocks()
- auth.loginAs(user, [dbUser - optional])
*/

describe('GET /term', () => {
  beforeEach(Term.resetAllMocks);

  // helper functions - id is a numeric value
  async function callGetOnTermRoute(row, key = 'id') {
    const id = row[key];
    Term.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/term/${id}`);
    return response;
  }

  describe('given a row id', () => {
    test('should make a call to Term.findOne', async () => {
      const row = dataForGetTerm(1)[0];
      await callGetOnTermRoute(row);
      expect(Term.findOne.mock.calls).toHaveLength(1);
      expect(Term.findOne.mock.calls[0]).toHaveLength(1);
      expect(Term.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containing the term data', async () => {
      const data = dataForGetTerm(10);
      for (const row of data) {
        const { body: term } = await callGetOnTermRoute(row);

        for (const key in Object.keys(row)) {
          expect(term).toHaveProperty(key, row[key]);
        }
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetTerm(1, 100);
      const response = await callGetOnTermRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when term exists', async () => {
      const data = dataForGetTerm(1, 100);
      const response = await callGetOnTermRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when term does NOT exists', async () => {
      Term.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/term/100`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Term.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/term/100`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('querying a group of terms', () => {
    test('should make a call to Term.findAll', async () => {
      const data = dataForGetTerm(10);
      Term.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/term`);
      expect(Term.findAll.mock.calls).toHaveLength(1);
      expect(Term.findAll.mock.calls[0]).toHaveLength(3);
      expect(Term.findAll.mock.calls[0][0]).toBeNull();
      expect(Term.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Term.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetTerm(3);
      Term.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/term?limit=3`);
      expect(Term.findAll.mock.calls).toHaveLength(1);
      expect(Term.findAll.mock.calls[0]).toHaveLength(3);
      expect(Term.findAll.mock.calls[0][0]).toBeNull();
      expect(Term.findAll.mock.calls[0][1]).toBe('3');
      expect(Term.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetTerm(3);
      Term.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/term?offset=1`);
      expect(Term.findAll.mock.calls).toHaveLength(1);
      expect(Term.findAll.mock.calls[0]).toHaveLength(3);
      expect(Term.findAll.mock.calls[0][0]).toBeNull();
      expect(Term.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Term.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetTerm(3, 1);
      Term.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/term?limit=3&offset=1`);
      expect(Term.findAll.mock.calls).toHaveLength(1);
      expect(Term.findAll.mock.calls[0]).toHaveLength(3);
      expect(Term.findAll.mock.calls[0][0]).toBeNull();
      expect(Term.findAll.mock.calls[0][1]).toBe('3');
      expect(Term.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should respond with a json array object containg the term data', async () => {
      const data = dataForGetTerm(5);
      Term.findAll.mockResolvedValueOnce(data);
      const { body: terms } = await request(app).get(`/term`);
      expect(terms).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(terms[i].id).toBe(data[i].id);
        expect(terms[i].prefix).toBe(data[i].prefix);
        expect(terms[i].suffix).toBe(data[i].suffix);
        expect(terms[i].title).toBe(data[i].title);
        expect(terms[i].description).toBe(data[i].description);
        expect(terms[i].credits).toBe(data[i].credits);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      Term.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/term`);
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      Term.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/term`);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when term data returned', async () => {
      const data = dataForGetTerm(5);
      Term.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get(`/term`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when term data returned (even no terms)', async () => {
      Term.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/term`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Term.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get(`/term`);
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});
