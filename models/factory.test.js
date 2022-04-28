global.jest.init(false); // Init without models
global.jest.init_db();
const { db } = global.jest;

const factory = require('./factory');
const join = require('../services/joiner');
const validate = require('../services/validator');
const { middlemen } = require('../services/schematools');
const tableList = Object.keys(validate);

const badData = 'Backend service received bad data!';
const unexpected = 'Unexpected DB condition: success, but no data returned';

describe('Model factory tests', () => {
  const dummy = {
    id: 123,
    foo: 'bar',
    bar: 'foo',
  };

  const dummyNoId = {
    foo: dummy.foo,
    bar: dummy.bar,
  };

  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue({ rows: [dummy] });
  });

  const falsyNotAllowed = (modelFunc) => {
    return async () => {
      await expect(modelFunc(null)).rejects.toThrowError(badData);
      await expect(modelFunc(undefined)).rejects.toThrowError(badData);
      await expect(modelFunc(false)).rejects.toThrowError(badData);
      await expect(modelFunc(0)).rejects.toThrowError(badData);
    };
  };

  tableList.forEach((tableName) => {
    describe(`findOne test for table ${tableName}`, () => {
      const modelFunc = factory.findOne(tableName);

      // eslint-disable-next-line jest/expect-expect
      test('with null criteria', falsyNotAllowed(modelFunc));

      test('with empty criteria', async () => {
        await expect(modelFunc({})).rejects.toThrowError(badData);
      });

      test('with primary key criteria', async () => {
        const result = await modelFunc({ id: '123' });
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `SELECT * from "${tableName}" WHERE "id"=$1 LIMIT 1;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(1);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(result).toEqual(dummy);
      });

      test('when nothing is found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const result = await modelFunc({ id: '123' });
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `SELECT * from "${tableName}" WHERE "id"=$1 LIMIT 1;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(1);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(result).toEqual({});
      });
    });

    describe(`findAll test for table ${tableName}`, () => {
      const modelFunc = factory.findAll(tableName);

      test('allow null or empty criteria', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(modelFunc(null)).resolves.toHaveLength(0);

        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(modelFunc({})).resolves.toHaveLength(0);

        expect(db.query).toHaveBeenCalledTimes(2);
        expect(db.query.mock.calls[0][0]).toBe(`SELECT * from "${tableName}"  LIMIT $1 OFFSET $2;`);
        expect(db.query.mock.calls[0][1]).toHaveLength(2);
        expect(db.query.mock.calls[0][1][0]).toBe(100);
        expect(db.query.mock.calls[0][1][1]).toBe(0);
        expect(db.query.mock.calls[1][0]).toBe(`SELECT * from "${tableName}"  LIMIT $1 OFFSET $2;`);
        expect(db.query.mock.calls[1][1]).toHaveLength(2);
        expect(db.query.mock.calls[1][1][0]).toBe(100);
        expect(db.query.mock.calls[1][1][1]).toBe(0);
      });

      test('with primary key criteria', async () => {
        const result = await modelFunc({ id: '123' });
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `SELECT * from "${tableName}" WHERE "id"=$1 LIMIT $2 OFFSET $3;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(db.query.mock.calls[0][1][1]).toBe(100);
        expect(db.query.mock.calls[0][1][2]).toBe(0);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(dummy);
      });

      test('when nothing is found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const result = await modelFunc({ id: '123' });
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `SELECT * from "${tableName}" WHERE "id"=$1 LIMIT $2 OFFSET $3;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(db.query.mock.calls[0][1][1]).toBe(100);
        expect(db.query.mock.calls[0][1][2]).toBe(0);
        // should return empty table
        expect(result).toHaveLength(0);
      });

      test('with custom limit and offset', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const result = await modelFunc({ id: '123' }, 512, 1024);
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `SELECT * from "${tableName}" WHERE "id"=$1 LIMIT $2 OFFSET $3;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(db.query.mock.calls[0][1][1]).toBe(512);
        expect(db.query.mock.calls[0][1][2]).toBe(1024);
        // should return empty table
        expect(result).toHaveLength(0);
      });
    });

    describe(`remove test for table ${tableName}`, () => {
      const modelFunc = factory.remove(tableName);

      test('disallow empty primary key', async () => {
        await expect(modelFunc('')).rejects.toThrowError(badData);
      });

      test('disallow criteria', async () => {
        await expect(modelFunc({})).rejects.toThrowError(badData);
        await expect(modelFunc({ id: '123' })).rejects.toThrowError(badData);
      });

      test('with valid primary key', async () => {
        const result = await modelFunc('123');
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `DELETE FROM "${tableName}" WHERE "id"=$1 RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(1);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        // should return one object
        expect(result).toEqual(dummy);
      });

      test('when nothing is found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const result = await modelFunc('123');
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `DELETE FROM "${tableName}" WHERE "id"=$1 RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(1);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        // should return empty object
        expect(result).toEqual({});
      });
    });

    describe(`create test for table ${tableName}`, () => {
      const modelFunc = factory.create(tableName);

      // eslint-disable-next-line jest/expect-expect
      test('disallow falsy criteria', falsyNotAllowed(modelFunc));

      test('disallow single values', async () => {
        await expect(modelFunc('123')).rejects.toThrowError(badData);
      });

      test('with criteria specified', async () => {
        const result = await modelFunc(dummyNoId);
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `INSERT INTO "${tableName}" ("foo","bar") VALUES ($1,$2) RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(2);
        expect(db.query.mock.calls[0][1][0]).toBe(dummy.foo);
        expect(db.query.mock.calls[0][1][1]).toBe(dummy.bar);
        // should return one object
        expect(result).toEqual(dummy);
      });
    });

    describe(`update test for table ${tableName}`, () => {
      const modelFunc = factory.update(tableName);

      test('disallow falsy parameters', async () => {
        await falsyNotAllowed(modelFunc)();
        await expect(modelFunc('123', null)).rejects.toThrowError(badData);
        await expect(modelFunc('123', undefined)).rejects.toThrowError(badData);
        await expect(modelFunc('123', false)).rejects.toThrowError(badData);
        await expect(modelFunc('123', 0)).rejects.toThrowError(badData);
      });

      test('disallow wrong number of parameters', async () => {
        await expect(modelFunc('123')).rejects.toThrowError(badData);
      });

      test('disallow non-object criteria', async () => {
        await expect(modelFunc('123', '456')).rejects.toThrowError(badData);
      });

      test('with id and criteria specified', async () => {
        const result = await modelFunc('123', dummyNoId);
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `UPDATE "${tableName}" SET "foo"=$2, "bar"=$3 WHERE "id"=$1 RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(db.query.mock.calls[0][1][1]).toBe(dummy.foo);
        expect(db.query.mock.calls[0][1][2]).toBe(dummy.bar);
        // should return one object
        expect(result).toEqual(dummy);
      });

      test('success but no data returned', async () => {
        db.query.mockResolvedValueOnce({ rows: [] }); // no data

        await expect(modelFunc('123', dummyNoId)).rejects.toThrowError(unexpected);
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `UPDATE "${tableName}" SET "foo"=$2, "bar"=$3 WHERE "id"=$1 RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        expect(db.query.mock.calls[0][1][1]).toBe(dummy.foo);
        expect(db.query.mock.calls[0][1][2]).toBe(dummy.bar);
      });
    });

    describe(`remove test for table ${tableName}`, () => {
      const modelFunc = factory.remove(tableName);

      test('disallow empty primary key', async () => {
        await expect(modelFunc('')).rejects.toThrowError(badData);
      });

      test('disallow criteria', async () => {
        await expect(modelFunc({})).rejects.toThrowError(badData);
        await expect(modelFunc({ id: '123' })).rejects.toThrowError(badData);
      });

      test('with valid primary key', async () => {
        const result = await modelFunc('123');
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `DELETE FROM "${tableName}" WHERE "id"=$1 RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(1);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        // should return one object
        expect(result).toEqual(dummy);
      });

      test('when nothing is found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const result = await modelFunc('123');
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `DELETE FROM "${tableName}" WHERE "id"=$1 RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(1);
        expect(db.query.mock.calls[0][1][0]).toBe('123');
        // should return empty object
        expect(result).toEqual({});
      });
    });

    describe(`create test for table ${tableName}`, () => {
      const modelFunc = factory.create(tableName);

      // eslint-disable-next-line jest/expect-expect
      test('disallow falsy criteria', falsyNotAllowed(modelFunc));

      test('disallow single values', async () => {
        await expect(modelFunc('123')).rejects.toThrowError(badData);
      });

      test('with criteria specified', async () => {
        const result = await modelFunc(dummyNoId);
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `INSERT INTO "${tableName}" ("foo","bar") VALUES ($1,$2) RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(2);
        expect(db.query.mock.calls[0][1][0]).toBe(dummy.foo);
        expect(db.query.mock.calls[0][1][1]).toBe(dummy.bar);
        // should return one object
        expect(result).toEqual(dummy);
      });

      test('success but no data returned', async () => {
        db.query.mockResolvedValueOnce({ rows: [] }); // no data

        await expect(modelFunc(dummyNoId)).rejects.toThrowError(unexpected);
        expect(db.query).toBeCalled();
        expect(db.query.mock.calls[0][0]).toBe(
          `INSERT INTO "${tableName}" ("foo","bar") VALUES ($1,$2) RETURNING *;`
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(2);
        expect(db.query.mock.calls[0][1][0]).toBe(dummy.foo);
        expect(db.query.mock.calls[0][1][1]).toBe(dummy.bar);
      });
    });

    describe(`count test for table ${tableName}`, () => {
      const modelFunc = factory.count(tableName);

      test('expect to return the count', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
        await expect(modelFunc()).resolves.toHaveProperty('count', 1);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(1);
        expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "${tableName}"`);
      });

      test('when the count is zero', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ count: 0 }] });
        await expect(modelFunc()).resolves.toHaveProperty('count', 0);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(1);
        expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "${tableName}"`);
      });

      test('when no rows are returned', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(modelFunc()).rejects.toThrowError(unexpected);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(1);
        expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "${tableName}"`);
      });
    });
  });

  Object.keys(middlemen).forEach((tableName) => {
    const adjoiningTableList = Object.keys(middlemen[tableName]);

    // get all possible combinations
    for (let i = 0; i < adjoiningTableList.length - 1; ++i)
      for (let j = i + 1; j < adjoiningTableList.length; ++j) {
        const table1 = adjoiningTableList[i];
        const table2 = adjoiningTableList[j];

        const createSpecificCriteria = (first, second) => ({
          [first]: {
            id: 123,
          },
          [second]: {
            id: 456,
          },
        });

        const joinOneSuite = (first, mid, second) =>
          describe(`joined find one from table ${first} to table ${second}`, () => {
            const modelFunc = factory.findOneJoined(first, second, join(first, mid, second));

            // eslint-disable-next-line jest/expect-expect
            test('disallow falsy specific criteria', falsyNotAllowed(modelFunc));

            test('disallow empty criteria', async () => {
              await expect(modelFunc({})).rejects.toThrowError(badData);
            });

            test('using specific criteria', async () => {
              const specificCriteria = createSpecificCriteria(first, second);
              await expect(modelFunc(specificCriteria)).resolves.toBe(dummy);

              expect(db.query).toHaveBeenCalledTimes(1);
              expect(db.query.mock.calls[0]).toHaveLength(2);
              expect(db.query.mock.calls[0][0]).toBe(
                `SELECT "${second}".* FROM "${first}" ${join(
                  first,
                  mid,
                  second
                )} WHERE "${first}"."id"=$1 AND "${second}"."id"=$2 LIMIT 1;`
              );
              expect(db.query.mock.calls[0][1]).toHaveLength(2);
              expect(db.query.mock.calls[0][1][0]).toBe(123);
              expect(db.query.mock.calls[0][1][1]).toBe(456);
            });

            test('using specific criteria, but no results found', async () => {
              db.query.mockResolvedValueOnce({ rows: [] });
              const specificCriteria = createSpecificCriteria(first, second);
              await expect(modelFunc(specificCriteria)).resolves.toEqual({});

              expect(db.query).toHaveBeenCalledTimes(1);
              expect(db.query.mock.calls[0]).toHaveLength(2);
              expect(db.query.mock.calls[0][0]).toBe(
                `SELECT "${second}".* FROM "${first}" ${join(
                  first,
                  mid,
                  second
                )} WHERE "${first}"."id"=$1 AND "${second}"."id"=$2 LIMIT 1;`
              );
              expect(db.query.mock.calls[0][1]).toHaveLength(2);
              expect(db.query.mock.calls[0][1][0]).toBe(123);
              expect(db.query.mock.calls[0][1][1]).toBe(456);
            });
          });

        const joinAllSuite = (first, mid, second) =>
          describe(`joined find all from table ${first} to table ${first}`, () => {
            const modelFunc = factory.findAllJoined(first, second, join(first, mid, second));

            test('using specific criteria', async () => {
              await expect(
                modelFunc({
                  [first]: {
                    id: 123,
                  },
                  [second]: {
                    id: 456,
                  },
                })
              ).resolves.toEqual(expect.arrayContaining([dummy]));
              expect(db.query).toHaveBeenCalledTimes(1);
              expect(db.query.mock.calls[0]).toHaveLength(2);
              expect(db.query.mock.calls[0][0]).toBe(
                `SELECT "${second}".* FROM "${first}" ${join(
                  first,
                  mid,
                  second
                )} WHERE "${first}"."id"=$1 AND "${second}"."id"=$2 LIMIT $3 OFFSET $4;`
              );
              expect(db.query.mock.calls[0][1]).toHaveLength(4);
              expect(db.query.mock.calls[0][1][0]).toBe(123);
              expect(db.query.mock.calls[0][1][1]).toBe(456);
              expect(db.query.mock.calls[0][1][2]).toBe(100);
              expect(db.query.mock.calls[0][1][3]).toBe(0);
            });

            test('with custom limit and offset', async () => {
              await expect(
                modelFunc(
                  {
                    [first]: {
                      id: 123,
                    },
                    [second]: {
                      id: 456,
                    },
                  },
                  512,
                  1024
                )
              ).resolves.toEqual(expect.arrayContaining([dummy]));
              expect(db.query).toHaveBeenCalledTimes(1);
              expect(db.query.mock.calls[0]).toHaveLength(2);
              expect(db.query.mock.calls[0][0]).toBe(
                `SELECT "${second}".* FROM "${first}" ${join(
                  first,
                  mid,
                  second
                )} WHERE "${first}"."id"=$1 AND "${second}"."id"=$2 LIMIT $3 OFFSET $4;`
              );
              expect(db.query.mock.calls[0][1]).toHaveLength(4);
              expect(db.query.mock.calls[0][1][0]).toBe(123);
              expect(db.query.mock.calls[0][1][1]).toBe(456);
              expect(db.query.mock.calls[0][1][2]).toBe(512);
              expect(db.query.mock.calls[0][1][3]).toBe(1024);
            });
          });

        // test all combos
        joinOneSuite(table1, tableName, table2);
        joinOneSuite(table2, tableName, table1);

        joinAllSuite(table1, tableName, table2);
        joinAllSuite(table2, tableName, table1);
      }

    const dummyForeign = {
      foobar: '1',
      barfoo: '2',
    };
    const dummyCombined = Object.assign({}, dummy, dummyForeign);

    describe(`combined insert/update for table ${tableName}`, () => {
      const modelFunc = factory.combinedInsertUpdate(tableName);

      // eslint-disable-next-line jest/expect-expect
      test('disallow falsy criteria', falsyNotAllowed(modelFunc));

      test('disallow zero criteria', async () => {
        await expect(modelFunc({})).rejects.toThrowError(badData);
      });

      test('successful insert/update with unique foreign keys', async () => {
        db.query.mockResolvedValueOnce({ rows: [dummyCombined] });
        await expect(modelFunc(dummyForeign, dummyNoId)).resolves.toBe(dummyCombined);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          `INSERT INTO "${tableName}" ("foobar","barfoo","foo","bar") VALUES ($1,$2,$3,$4) ON CONFLICT ("foobar","barfoo") DO UPDATE SET "foobar"=$1, "barfoo"=$2, "foo"=$3, "bar"=$4 RETURNING *;`
        );
      });

      test('success but no data returned', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(modelFunc(dummyForeign, dummyNoId)).rejects.toThrowError(unexpected);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          `INSERT INTO "${tableName}" ("foobar","barfoo","foo","bar") VALUES ($1,$2,$3,$4) ON CONFLICT ("foobar","barfoo") DO UPDATE SET "foobar"=$1, "barfoo"=$2, "foo"=$3, "bar"=$4 RETURNING *;`
        );
      });
    });

    describe(`remove with criteria for table ${tableName}`, () => {
      const modelFunc = factory.removeWithCriteria(tableName);

      // eslint-disable-next-line jest/expect-expect
      test('disallow falsy criteria', falsyNotAllowed(modelFunc));

      test('disallow zero criteria', async () => {
        await expect(modelFunc({})).rejects.toThrowError(badData);
      });

      test('successful removal using the criteria', async () => {
        db.query.mockResolvedValueOnce({ rows: [dummyCombined] });
        await expect(modelFunc(dummyForeign)).resolves.toBe(dummyCombined);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          `DELETE FROM "${tableName}" WHERE "foobar"=$1 AND "barfoo"=$2 RETURNING *;`
        );
      });

      test('when the item to remove is not found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(modelFunc(dummyForeign)).resolves.toEqual({});
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          `DELETE FROM "${tableName}" WHERE "foobar"=$1 AND "barfoo"=$2 RETURNING *;`
        );
      });
    });
  });
});
