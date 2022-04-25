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
} = require('./../services/schematools');

describe('Schema tools - route generators', () => {
  beforeEach(clearMockRes);

  tableList.forEach((tableName) => {
    describe(`create generator using table ${tableName}`, () => {
      const modelFunc = jest.fn();
      const middleware = create(tableName, modelFunc);

      const dummy = {
        id: 1,
        foo: 'bar',
        bar: 'foo',
      };

      beforeEach(() => {
        modelFunc.mockReset();
        modelFunc.mockResolvedValue(dummy);
      });

      test('should be successful with good body', async () => {
        const good = goodBadData[tableName].good;
        const req = getMockReq({ body: good });
        // request with good data
        await middleware(req, res, next);
        expect(next).not.toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.send.mock.calls[0]).toHaveLength(1);
        expect(res.send.mock.calls[0][0]).toEqual(dummy);
      });

      test('should throw 500 if successful insert but empty response (should be impossible)', async () => {
        const good = goodBadData[tableName].good;
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
        const bad = goodBadData[tableName].bad;
        const req = getMockReq({ body: bad });
        // request with bad data
        await middleware(req, res, next);
        expect(next).toBeCalled();
        expect(next.mock.calls[0]).toHaveLength(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Invalid Parameters');
      });
    });
  });
});
