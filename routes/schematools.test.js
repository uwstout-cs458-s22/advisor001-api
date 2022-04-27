// Schema tools tester 2 - testing auto generated routes

// will be needed for endpoint generator tests
const { getMockReq, getMockRes } = require('@jest-mock/express');
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
      const tableList = Object.keys(middlemen[tableName]);
      const foreignKeyList = Object.values(middlemen[tableName]);

      const getSpecificCriteria = (howMany, offset = 1) => {
        // limit table names if not undefined
        const whichTableNames = howMany ? [...tableList].splice(0, howMany) : tableList;
        return Object.fromEntries(
          whichTableNames.map((adjoiningTableName, index) => {
            return [adjoiningTableName, { id: String(index + offset) }];
          })
        );
      };

      const getURLBarParams = (howMany, offset = 1) => {
        return Object.fromEntries(
          [...tableList].splice(0, howMany).map((adjoiningTableName, index) => {
            return [adjoiningTableName, String(index + offset)];
          })
        );
      };

      const getForeignKeysAfter = (startWhere, offset = 1) => {
        const whichForeignKeys = [...foreignKeyList].splice(startWhere);
        return Object.fromEntries(
          whichForeignKeys.map((foreignKeyName, index) => {
            return [foreignKeyName, String(index + startWhere + offset)];
          })
        );
      };

      const getNonUniqueBody = (sampleData) => {
        const result = {};
        Object.entries(sampleData).forEach(([key, value]) => {
          if (!foreignKeyList.includes(key)) {
            result[key] = value;
          }
        });
        return result;
      };

      const { good, bad } = goodBadData[tableName];

      describe(`joined read one generator using table ${tableName}`, () => {
        const middleware = readOneJoined(tableName, modelFunc);

        const goodParams = getURLBarParams(2);
        const specificCriteria = getSpecificCriteria(2);

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
            params: getURLBarParams(1),
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
        const goodParams = getURLBarParams(1);
        const specificCriteria = getSpecificCriteria(1);

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

      describe(`combined insert/update generator using table ${tableName}`, () => {
        const middleware = insertOrUpdate(tableName, modelFunc);

        const URLParams = getURLBarParams(2);
        const bodyParams = getForeignKeysAfter(2);
        const allParams = getForeignKeysAfter(0);

        const newValues = getNonUniqueBody(good);
        const goodBody = Object.assign({}, bodyParams, newValues);

        const paramsStr = JSON.stringify(URLParams);
        const bodyStr = JSON.stringify(goodBody);

        test(`should work with params ${paramsStr} and body ${bodyStr}`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(next).not.toBeCalled();
          expect(res.send).toBeCalled();
          expect(res.send.mock.calls[0]).toHaveLength(1);
          expect(res.send.mock.calls[0][0]).toEqual(dummy);
        });

        test(`should fail if not enough params`, async () => {
          let req = getMockReq({
            params: getURLBarParams(1),
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(res.send).not.toBeCalled();
          expect(modelFunc).not.toBeCalled();
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(400);
          expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');

          req = getMockReq({
            params: {},
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(res.send).not.toBeCalled();
          expect(modelFunc).not.toBeCalled();
          expect(next).toHaveBeenCalledTimes(2);
          expect(next.mock.calls[1]).toHaveLength(1);
          expect(next.mock.calls[1][0].statusCode).toBe(400);
          expect(next.mock.calls[1][0].message).toBe('Required Parameters Missing');
        });

        if (Object.keys(goodBody).length > 0) {
          test(`should fail if empty body`, async () => {
            const req = getMockReq({
              params: URLParams,
              body: {},
            });
            await middleware(req, res, next);
            expect(res.send).not.toBeCalled();
            expect(modelFunc).not.toBeCalled();
            expect(next).toBeCalled();
            expect(next.mock.calls[0]).toHaveLength(1);
            expect(next.mock.calls[0][0].statusCode).toBe(400);
            expect(next.mock.calls[0][0].message).toBe('Invalid Parameters');
          });
        }

        test(`should make a call to the model func`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(modelFunc).toHaveBeenCalledTimes(1);
          expect(modelFunc.mock.calls[0]).toHaveLength(2);
          expect(modelFunc.mock.calls[0][0]).toEqual(allParams);
          expect(modelFunc.mock.calls[0][1]).toEqual(newValues);
        });

        const badValues = getNonUniqueBody(bad);

        if (Object.keys(badValues).length > 0) {
          const badBody = Object.assign({}, bodyParams, badValues);

          test(`should fail if invalid body`, async () => {
            const req = getMockReq({
              params: URLParams,
              body: badBody,
            });
            await middleware(req, res, next);
            expect(next).toBeCalled();
            expect(next.mock.calls[0]).toHaveLength(1);
            expect(next.mock.calls[0][0].statusCode).toBe(400);
            expect(next.mock.calls[0][0].message).toBe('Invalid Parameters');
          });
        }

        test(`should fail if the model returns bad data`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          modelFunc.mockResolvedValueOnce({});
          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(500);
          expect(next.mock.calls[0][0].message).toBe('Internal Server Error');

          modelFunc.mockResolvedValueOnce(false);
          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(500);
          expect(next.mock.calls[0][0].message).toBe('Internal Server Error');
        });

        test(`should fail if the model throws an exception`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          modelFunc.mockRejectedValueOnce(new Error('a test error'));
          await middleware(req, res, next);
          expect(res.send).not.toBeCalled();
          expect(modelFunc).toBeCalled();
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0]).toHaveProperty('message', 'a test error');
        });
      });

      describe(`remove WITH CRITERIA generator for ${tableName}`, () => {
        const middleware = removeWithCriteria(tableName, modelFunc);

        const URLParams = getURLBarParams(2);
        const bodyParams = getForeignKeysAfter(2);
        const allParams = getForeignKeysAfter(0);

        const newValues = getNonUniqueBody(good);
        const goodBody = Object.assign({}, bodyParams, newValues);

        const paramsStr = JSON.stringify(URLParams);
        const bodyStr = JSON.stringify(goodBody);

        test(`should work with params ${paramsStr} and body ${bodyStr}`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(next).not.toBeCalled();
          expect(res.send).toBeCalled();
          expect(res.send.mock.calls[0]).toHaveLength(1);
          expect(res.send.mock.calls[0][0]).toEqual(dummy);
        });

        test(`should fail if not enough params`, async () => {
          let req = getMockReq({
            params: getURLBarParams(1),
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(res.send).not.toBeCalled();
          expect(modelFunc).not.toBeCalled();
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(400);
          expect(next.mock.calls[0][0].message).toBe('Required Parameters Missing');

          req = getMockReq({
            params: {},
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(res.send).not.toBeCalled();
          expect(modelFunc).not.toBeCalled();
          expect(next).toHaveBeenCalledTimes(2);
          expect(next.mock.calls[1]).toHaveLength(1);
          expect(next.mock.calls[1][0].statusCode).toBe(400);
          expect(next.mock.calls[1][0].message).toBe('Required Parameters Missing');
        });

        test(`should make a call to the model func`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          await middleware(req, res, next);
          expect(modelFunc).toHaveBeenCalledTimes(1);
          expect(modelFunc.mock.calls[0]).toHaveLength(1);
          expect(modelFunc.mock.calls[0][0]).toEqual(allParams);
        });

        test(`should 404 if item to remove was not found`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          modelFunc.mockResolvedValueOnce({});
          await middleware(req, res, next);
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0].statusCode).toBe(404);
          expect(next.mock.calls[0][0].message).toBe('Not Found');
        });

        test(`should fail if the model throws an exception`, async () => {
          const req = getMockReq({
            params: URLParams,
            body: goodBody,
          });
          modelFunc.mockRejectedValueOnce(new Error('a test error'));
          await middleware(req, res, next);
          expect(res.send).not.toBeCalled();
          expect(modelFunc).toBeCalled();
          expect(next).toBeCalled();
          expect(next.mock.calls[0]).toHaveLength(1);
          expect(next.mock.calls[0][0]).toHaveProperty('message', 'a test error');
        });
      });
    });
  });
});
