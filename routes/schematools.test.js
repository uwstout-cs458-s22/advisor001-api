// Schema tools tester 2 - testing auto generated routes
global.jest.init(false);

// will be needed for endpoint generator tests
const { getMockReq, getMockRes } = require('@jest-mock/express');
const { combinedInsertUpdate } = require('../models/factory');
const { res, next, clearMockRes } = getMockRes({});

// good and bad data for each field
const { goodBadData } = global.jest;
const tableList = Object.keys(goodBadData);

const {
  // the generators
  create,
  update,
  readOne,
  readMany,
  remove,
  // the newer, more complicated ones
  readOneJoined,
  readManyJoined,
  insertOrUpdate,
  removeWithCriteria,
} = require('./../services/schematools');

// grab middlemen rules
// ADDED TO JEST GLOBAL BY schematools.js
// BUT ONLY IF global.jest IS DEFINED
const { middlemen } = global.jest;

describe('Schema tools - route generators', () => {
  const dummy = {
    id: 1,
    foo: 'bar',
    bar: 'foo',
  };

  const modelFunc = jest.fn();

  beforeEach(() => {
    clearMockRes();
    modelFunc.mockReset();
    modelFunc.mockResolvedValue(dummy);
  });

  tableList.forEach((tableName) => {
    const { good, bad } = goodBadData[tableName];

    describe(`create generator using table ${tableName}`, () => {
      const middleware = create(tableName, modelFunc);

      test('should be successful with good body', async () => {
        const req = getMockReq({ body: good });
        // request with good data
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toEqual(dummy);
      });

      test('should make a call to the model func', async () => {
        const req = getMockReq({ body: good });
        // request with good data
        await middleware(req, res, next);
        expect(modelFunc).toHaveBeenCalledTimes(1);
        expect(modelFunc.mock.calls[0]).toHaveLength(1);
        expect(modelFunc.mock.calls[0][0]).toEqual(good);
      });

      test('should throw 500 if successful insert but empty response (should be impossible)', async () => {
        const req = getMockReq({ body: good });
        // nothing returned
        modelFunc.mockResolvedValueOnce({});
        // request with good data
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
        expect(next.mock.calls[0][0].message).toBe('Internal Server Error');
      });

      test('should not work with bad body', async () => {
        const req = getMockReq({ body: bad });
        // request with bad data
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Invalid Parameters');
      });
    });

    describe(`update generator using table ${tableName}`, () => {
      const middleware = update(tableName, modelFunc);

      test('should be successful with good body and good params', async () => {
        const req = getMockReq({
          body: good,
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toEqual(dummy);
      });

      test('should make a call to the model func', async () => {
        const req = getMockReq({
          body: good,
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(modelFunc).toHaveBeenCalledTimes(1);
        expect(modelFunc.mock.calls[0]).toHaveLength(2);
        expect(modelFunc.mock.calls[0][0]).toEqual('123');
        expect(modelFunc.mock.calls[0][1]).toEqual(good);
      });

      test('should throw 400 if no params', async () => {
        const req = getMockReq({
          body: good,
          params: {},
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 400 if empty params', async () => {
        const req = getMockReq({
          body: good,
          params: {
            id: '',
          },
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 400 if failed to validate', async () => {
        const req = getMockReq({
          body: bad,
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Invalid Parameters');
      });

      test('should throw 400 if no editable params specified', async () => {
        const req = getMockReq({
          body: {
            foo: 'bar',
            bar: 'foo',
          },
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 404 if not found', async () => {
        const req = getMockReq({
          body: good,
          params: {
            id: '123',
          },
        });
        modelFunc.mockResolvedValueOnce({}); // behavior if not found
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(404);
        expect(next.mock.calls[0][0].message).toBe('Not Found');
      });
    });

    describe(`read one generator using table ${tableName}`, () => {
      const middleware = readOne(tableName, modelFunc);

      test('should be successful with good params', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toEqual(dummy);
      });

      test('should make a call to the model func', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(modelFunc).toHaveBeenCalledTimes(1);
        expect(modelFunc.mock.calls[0]).toHaveLength(1);
        expect(modelFunc.mock.calls[0][0]).toHaveProperty('id', '123');
      });

      test('should throw 400 if no params', async () => {
        const req = getMockReq({
          params: {},
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 400 if empty params', async () => {
        const req = getMockReq({
          params: {
            id: '',
          },
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 404 if not found', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        modelFunc.mockResolvedValueOnce({}); // behavior if not found
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(404);
        expect(next.mock.calls[0][0].message).toBe('Not Found');
      });
    });

    describe(`read many generator using table ${tableName}`, () => {
      const middleware = readMany(tableName, modelFunc);

      // return a table instead
      beforeEach(() => modelFunc.mockResolvedValue([dummy]));

      test('should be successful with no query', async () => {
        const req = getMockReq({});
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toEqual(expect.arrayContaining([dummy]));
      });

      test('should make a call to the model func', async () => {
        const req = getMockReq({
          query: {
            limit: undefined,
            offset: undefined,
          },
        });
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(modelFunc).toHaveBeenCalledTimes(1);
        expect(modelFunc.mock.calls[0]).toHaveLength(3);
        expect(modelFunc.mock.calls[0][0]).toBe(null);
        expect(modelFunc.mock.calls[0][1]).toBe(req.query.limit);
        expect(modelFunc.mock.calls[0][2]).toBe(req.query.offset);
      });

      test('should throw if model has an error', async () => {
        modelFunc.mockRejectedValueOnce(new Error('a test error'));
        await middleware(getMockReq({}), res, next);
        // should pass to error handler
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0]).toHaveProperty('message', 'a test error');
      });

      test('should work with custom limit and offset', async () => {
        const req = getMockReq({
          query: {
            limit: 512,
            offset: 1024,
          },
        });
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(modelFunc).toHaveBeenCalledTimes(1);
        expect(modelFunc.mock.calls[0]).toHaveLength(3);
        expect(modelFunc.mock.calls[0][0]).toBe(null);
        expect(modelFunc.mock.calls[0][1]).toBe(512);
        expect(modelFunc.mock.calls[0][2]).toBe(1024);
      });

      test('should return empty table if not found', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        modelFunc.mockResolvedValueOnce([]); // behavior if not found
        await middleware(req, res, next);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toHaveLength(0);
        expect(next).not.toBeCalled();
      });
    });

    describe(`remove generator using table ${tableName}`, () => {
      const middleware = remove(tableName, modelFunc);

      test('should be successful with good params', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toEqual(dummy);
      });

      test('should make a call to the model func', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        await middleware(req, res, next);
        expect(modelFunc).toHaveBeenCalledTimes(1);
        expect(modelFunc.mock.calls[0]).toHaveLength(1);
        expect(modelFunc.mock.calls[0][0]).toBe('123');
      });

      test('should throw 400 if no params', async () => {
        const req = getMockReq({
          params: {},
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 400 if empty params', async () => {
        const req = getMockReq({
          params: {
            id: '',
          },
        });
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
      });

      test('should throw 404 if not found', async () => {
        const req = getMockReq({
          params: {
            id: '123',
          },
        });
        modelFunc.mockResolvedValueOnce({}); // behavior if not found
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(404);
        expect(next.mock.calls[0][0].message).toBe('Not Found');
      });
    });
  });

  /*
   *
   *
   */
  describe('exclusively for "middlemen" tables', () => {
    Object.keys(middlemen).forEach((tableName) => {
      // ---- begin tests for more complicated stuff ----
      const paramKeys = Object.keys(middlemen[tableName]);

      describe(`joined read one generator using table ${tableName}`, () => {
        const middleware = readOneJoined(tableName, modelFunc);

        const goodParams = {};
        const specificCriteria = {};

        paramKeys.forEach((adjoiningTableName, index) => {
          // get good sample params
          // { paramName: 1, otherParamName: 2 }
          goodParams[adjoiningTableName] = String(1 + index);
          // get expected specific criteria
          // { paramName: { id: 1 }, otherParamName: { id: 2} }
          specificCriteria[adjoiningTableName] = { id: String(1 + index) };
        });

        test(`should work using params ${JSON.stringify(goodParams)}`, async () => {
          const req = getMockReq({ params: goodParams });
          await middleware(req, res, next);
          expect(next).not.toBeCalled();
          expect(res.send).toBeCalled();
          expect(res.send.mock.calls[0]).toHaveLength(1);
          expect(res.send.mock.calls[0][0]).toBe(dummy);
        });

        test(`should fail if not enough params`, async () => {
          // only one parameter
          let req = getMockReq({
            params: {
              [paramKeys[0]]: goodParams[paramKeys[0]],
            },
          });
          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(400);
          expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');

          next.mockReset();
          clearMockRes();

          // no parameters at all
          req = getMockReq({
            params: {},
          });
          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(400);
          expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
        });

        test('should make a call to the model func', async () => {
          const req = getMockReq({ params: goodParams });
          await middleware(req, res, next);
          expect(modelFunc).toHaveBeenCalledTimes(1);
          expect(modelFunc.mock.calls[0]).toHaveLength(1);
          expect(modelFunc.mock.calls[0][0]).toEqual(specificCriteria);
        });

        test(`should 404 if not found`, async () => {
          const req = getMockReq({ params: goodParams });
          modelFunc.mockResolvedValueOnce({}); // not found

          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(404);
          expect(next.mock.calls[0][0].message).toBe('Not Found');
        });
      });

      describe(`joined read many generator using table ${tableName}`, () => {
        const middleware = readManyJoined(tableName, modelFunc);

        // good params -- should only take one param
        const goodParams = {
          [paramKeys[0]]: 1,
        };
        const specificCriteria = {
          [paramKeys[0]]: { id: 1 },
        };

        // return a table instead
        beforeEach(() => modelFunc.mockResolvedValue([dummy]));

        test(`should work with only one param`, async () => {
          // only one parameter
          const req = getMockReq({ params: goodParams });
          await middleware(req, res, next);
          expect(next).not.toBeCalled();
          expect(res.send).toBeCalled();
          expect(res.send.mock.calls[0]).toHaveLength(1);
          expect(res.send.mock.calls[0][0]).toEqual(expect.arrayContaining([dummy]));
        });

        test('should make a call to the model func', async () => {
          const req = getMockReq({ params: goodParams });
          await middleware(req, res, next);
          expect(modelFunc).toHaveBeenCalledTimes(1);
          expect(modelFunc.mock.calls[0]).toHaveLength(3);
          // specific criteria, with only first id
          expect(modelFunc.mock.calls[0][0]).toEqual(specificCriteria);
          expect(modelFunc.mock.calls[0][1]).toBe(undefined);
          expect(modelFunc.mock.calls[0][2]).toBe(undefined);
        });

        test('should work with custom limit and offset', async () => {
          const req = getMockReq({
            params: goodParams,
            query: {
              limit: 512,
              offset: 1024,
            },
          });
          await middleware(req, res, next);
          expect(modelFunc).toHaveBeenCalledTimes(1);
          expect(modelFunc.mock.calls[0]).toHaveLength(3);
          // specific criteria, with only first id
          expect(modelFunc.mock.calls[0][0]).toEqual(specificCriteria);
          expect(modelFunc.mock.calls[0][1]).toBe(512);
          expect(modelFunc.mock.calls[0][2]).toBe(1024);
        });

        test('should fail with zero params', async () => {
          // no parameters at all
          const req = getMockReq({
            params: {},
          });
          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(400);
          expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');
        });

        test(`should return empty list if not found`, async () => {
          const req = getMockReq({ params: goodParams });
          modelFunc.mockResolvedValueOnce([]); // not found

          await middleware(req, res, next);
          expect(next).not.toBeCalled();
          expect(res.send).toBeCalled();
          expect(res.send.mock.calls[0]).toHaveLength(1);
          expect(res.send.mock.calls[0][0]).toHaveLength(0);
        });
      });

      // describe(`combined insert/update generator using table ${tableName}`, () => {
      //   const middleware = combinedInsertUpdate(tableName, modelFunc);
      // });

      // describe(`remove WITH CRITERIA generator using table ${tableName}`, () => {
      //   const middleware = combinedInsertUpdate(tableName, modelFunc);
      // });
    });
  });
});
