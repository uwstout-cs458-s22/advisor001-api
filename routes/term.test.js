// Must be at the top. Provided by jest/tests_common
global.jest.init();
global.jest.init_routes();
const { Term, app, request, samplePrivilegedUser, dataForGetUser, dataForGetTerm, auth } =
  global.jest;

const { extractKeys } = require('../services/utils');

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

describe('PUT /term', () => {
  // TODO please make sure these tests meet the user acceptance criteria

  beforeEach(Term.resetAllMocks);

  // put helper
  async function callPutOnTermRoute(id, body) {
    return request(app).put(`/term/${id}`).send(body);
  }

  describe('given an empty URL bar', () => {
    test('should result in 400', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const term = dataForGetTerm(1)[0];
      const desiredChanges = {
        semester: 2,
        startyear: 2021,
      };

      Term.edit.mockResolvedValueOnce(Object.assign(term, desiredChanges));

      const response = await callPutOnTermRoute('', desiredChanges); // NO TERM ID
      expect(Term.edit).not.toBeCalled();
      expect(Term.findOne).not.toBeCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Required Parameters Missing');
    });
  });

  describe('when URL bar is non-empty', () => {
    test('should 500 when editor is not found in database', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor, {}); // NO EDITOR (2nd param is database-resolved user)

      const term = dataForGetTerm(1)[0];
      const desiredChanges = {
        semester: 2,
        startyear: 2021,
      };

      Term.edit.mockResolvedValueOnce(Object.assign(term, desiredChanges));

      const response = await callPutOnTermRoute(term.id, desiredChanges);
      expect(Term.edit).not.toBeCalled();
      expect(Term.findOne).not.toBeCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Your account is not found in the database!');
    });

    test('should 401 when not authorized to edit terms', async () => {
      const editor = dataForGetUser(1, 100)[0]; // UNPRIVILEGED USER
      editor.enable = 'true';
      auth.loginAs(editor);

      const term = dataForGetTerm(1)[0];
      const desiredChanges = {
        semester: 2,
        startyear: 2021,
      };

      Term.edit.mockResolvedValueOnce(Object.assign(term, desiredChanges));

      const response = await callPutOnTermRoute(term.id, desiredChanges);
      expect(Term.edit).not.toBeCalled();
      expect(Term.findOne).not.toBeCalled();
      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe('You are not allowed to do that!');
    });

    test('should 404 when the term is not found', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const desiredChanges = {
        semester: 2,
        startyear: 2021,
      };

      Term.edit.mockResolvedValueOnce({});

      const response = await callPutOnTermRoute(1, desiredChanges);
      expect(Term.edit).toBeCalled();
      expect(Term.edit.mock.calls[0][0]).toBe('1');
      expect(Term.edit.mock.calls[0][1]).toHaveProperty('semester', 2);
      expect(Term.edit.mock.calls[0][1]).toHaveProperty('startyear', 2021);
      expect(response.statusCode).toBe(404);
      expect(response.body.error.message).toBe('Not Found');
    });

    test('should 404 when term is not found and no params specified', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      Term.edit.mockResolvedValueOnce({});
      Term.findOne.mockResolvedValueOnce({});

      const response = await callPutOnTermRoute(1, {});
      expect(Term.edit).not.toBeCalled();
      expect(Term.findOne).toBeCalled();
      expect(Term.findOne.mock.calls[0][0]).toHaveProperty('id', '1');
      expect(response.statusCode).toBe(404);
      expect(response.body.error.message).toBe('Not Found');
    });

    test('should just return found term if no editable params are specified', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const desiredChanges = {
        foo: 'bar',
        bar: 'foo',
      };
      const term = dataForGetTerm(1)[0];
      Term.edit.mockResolvedValueOnce(term);
      Term.findOne.mockResolvedValueOnce(term);

      const response = await callPutOnTermRoute(1, desiredChanges);
      expect(Term.edit).not.toBeCalled();
      expect(Term.findOne).toBeCalled();
      expect(Term.findOne.mock.calls[0][0]).toHaveProperty('id', '1');
      expect(response.statusCode).toBe(200);
      for (const key of Object.keys(term)) {
        expect(response.body).toHaveProperty(key, term[key]);
      }
    });

    test('should respond 200 and successfully return edited version of term', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const term = dataForGetTerm(1)[0];
      const desiredChanges = {
        semester: 2,
        startyear: 2021,
      };

      const expectedReturn = Object.assign(term, desiredChanges);
      Term.edit.mockResolvedValueOnce(expectedReturn);

      const response = await callPutOnTermRoute(term.id, desiredChanges);

      expect(response.statusCode).toBe(200);
      for (const key of Object.keys(expectedReturn)) {
        expect(response.body).toHaveProperty(key, expectedReturn[key]);
      }
    });

    test('should still work even if no body parameters are specified', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const term = dataForGetTerm(1)[0];

      Term.edit.mockResolvedValueOnce(term);
      Term.findOne.mockResolvedValueOnce(term);
      const response = await callPutOnTermRoute(term.id, {});

      expect(Term.edit).not.toBeCalled();
      expect(Term.findOne).toBeCalled();
      expect(Term.findOne.mock.calls).toHaveLength(1);
      expect(Term.findOne.mock.calls[0]).toHaveLength(1);
      expect(Term.findOne.mock.calls[0][0]).toHaveProperty('id', term.id);

      expect(response.statusCode).toBe(200);
      for (const key of Object.keys(term)) {
        expect(response.body).toHaveProperty(key, term[key]);
      }
    });

    test('should work even if random parameters are thrown in', async () => {
      const editor = samplePrivilegedUser();
      auth.loginAs(editor);

      const term = dataForGetTerm(1)[0];
      const desiredChanges = {
        semester: 2,
        startyear: 2021,
        foo: 'bar',
        bar: 'foo',
        title: 'lorem ipsum dolor',
      };

      const expectedReturn = Object.assign(term, extractKeys(desiredChanges, ...Term.properties));
      Term.edit.mockResolvedValueOnce(expectedReturn);

      const response = await callPutOnTermRoute(term.id, desiredChanges);

      expect(Term.edit.mock.calls).toHaveLength(1);
      expect(Term.edit.mock.calls[0]).toHaveLength(2);
      expect(Term.edit.mock.calls[0][0]).toBe(term.id);
      expect(Term.edit.mock.calls[0][1]).toHaveProperty('semester', 2);
      expect(Term.edit.mock.calls[0][1]).toHaveProperty('startyear', 2021);
      expect(Term.edit.mock.calls[0][1]).toHaveProperty('title', 'lorem ipsum dolor');
      expect(Term.edit.mock.calls[0][1]).not.toHaveProperty('foo');
      expect(Term.edit.mock.calls[0][1]).not.toHaveProperty('bar');

      expect(response.statusCode).toBe(200);
      for (const key of Object.keys(term)) {
        expect(response.body).toHaveProperty(key, term[key]);
      }
    });
  });
});
