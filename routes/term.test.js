// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const {
  Term,
  auth,
  app,
  request,
  dataForGetTerm,
  dataForGetCourse,
  dataForGetUser,
  samplePrivilegedUser,
} = global.jest;

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
});
