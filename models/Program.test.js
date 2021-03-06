global.jest.init(false); // Init without models
global.jest.init_db();
const { dataForGetProgram, db } = global.jest;

const Program = require('./Program');

describe('Program Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('querying a single program by id', () => {
    test('confirm calls to query', async () => {
      const data = dataForGetProgram(1);
      const id = data[0].id;

      db.query.mockResolvedValue({ rows: data });
      await Program.findOne({ id });

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('should return a single program', async () => {
      const row = dataForGetProgram(1)[0];
      const id = row.id;

      db.query.mockResolvedValue({ rows: [row] });
      const program = await Program.findOne({ id });

      for (const key of Object.keys(row)) {
        expect(program).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound program', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const program = await Program.findOne({ id: 123 });

      expect(Object.keys(program)).toHaveLength(0);
    });

    test('should throw error for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Program.findOne({ id: 123 })).rejects.toThrowError('a testing database error');
    });

    test('should throw error if no parameters', async () => {
      await expect(Program.findOne()).rejects.toThrowError('Id is required.');
    });
  });

  describe('querying groups of programs', () => {
    test('should make a call to Program.findAll - no criteria, no limits, no offsets', async () => {
      const data = dataForGetProgram(5);
      db.query.mockResolvedValueOnce({ rows: data });

      const programs = await Program.findAll();

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('SELECT * from "program"  LIMIT $1 OFFSET $2;');
      expect(db.query.mock.calls[0][1]).toHaveLength(2);
      expect(db.query.mock.calls[0][1][0]).toBe(100);
      expect(db.query.mock.calls[0][1][1]).toBe(0);
      expect(programs).toHaveLength(data.length);

      for (let i = 0; i < data.length; i++) {
        for (const key of Object.keys(data[i])) {
          expect(programs[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Program.findAll - with criteria, no limits, no offsets', async () => {
      const data = dataForGetProgram(5);
      db.query.mockResolvedValueOnce({ rows: data });
      const programs = await Program.findAll(
        { description: 'Program description goes here' },
        undefined
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "program" WHERE "description"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe('Program description goes here');
      expect(db.query.mock.calls[0][1][1]).toBe(100);
      expect(db.query.mock.calls[0][1][2]).toBe(0);
      expect(programs).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key of Object.keys(data[i])) {
          expect(programs[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Program.findAll - with criteria, with limits, no offsets', async () => {
      const data = dataForGetProgram(3);
      db.query.mockResolvedValueOnce({ rows: data });
      const programs = await Program.findAll({ description: 'Program description goes here' }, 5);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "program" WHERE "description"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe('Program description goes here');
      expect(db.query.mock.calls[0][1][1]).toBe(5);
      expect(db.query.mock.calls[0][1][2]).toBe(0);
      expect(programs).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key of Object.keys(data[i])) {
          expect(programs[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Program.findAll - with criteria, with limits, with offsets', async () => {
      const data = dataForGetProgram(3, 1);
      db.query.mockResolvedValueOnce({ rows: data });
      const programs = await Program.findAll(
        { description: 'Program description goes here' },
        5,
        1
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "program" WHERE "description"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe('Program description goes here');
      expect(db.query.mock.calls[0][1][1]).toBe(5);
      expect(db.query.mock.calls[0][1][2]).toBe(1);
      expect(programs).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key of Object.keys(data[i])) {
          expect(programs[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Program.findAll()).rejects.toThrowError('a testing database error');
    });
  });

  describe('Adding Program', () => {
    // helper that runs the add
    function doAdd(newProgram) {
      db.query.mockResolvedValueOnce({ rows: [newProgram] });
      return Program.addProgram(newProgram);
    }

    test('Adding single program success', async () => {
      const program = dataForGetProgram(1)[0];
      const result = await doAdd(program);

      // should return property
      for (const key of Object.keys(program)) {
        expect(result).toHaveProperty(key, program[key]);
      }
    });

    test('Inputting invalid value', async () => {
      const program = dataForGetProgram(1)[0];
      program.description = { test: "object that's not string" };

      await expect(doAdd(program)).rejects.toThrowError('Incompatible Program Parameter Types');
    });

    test('Inputting null parameters', async () => {
      await expect(doAdd(null)).rejects.toThrowError('Missing Program Parameters');
      expect(db.query).not.toBeCalled();
    });

    test('Inputting empty object', async () => {
      await expect(doAdd({})).rejects.toThrowError('Missing Program Parameters');
      expect(db.query).not.toBeCalled();
    });

    test('Adding single program success, but no returned result', async () => {
      const program = dataForGetProgram(1)[0];
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(Program.addProgram(program)).rejects.toThrowError(
        'Unexpected DB Condition, insert sucessful with no returned record'
      );
    });
  });

  describe('Count Programs', () => {
    test('One Program in the Database', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
      const res = await Program.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "program"`);
      expect(res).toHaveProperty('count', 1);
    });
    test('Unexpected condition, no return', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(Program.count()).rejects.toThrowError('Some Error Occurred');
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "program"`);
    });
  });

  describe('Delete Programs', () => {
    test('Program.deleteProgram with expected data', async () => {
      const data = dataForGetProgram(1);
      const id = data[0].id;

      db.query.mockResolvedValueOnce({ rows: data });
      const deleteProgram = await Program.deleteProgram(id);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "program" WHERE "id"=$1;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
      expect(deleteProgram).toBe(true);
    });

    test('Program.deleteProgram with database error', async () => {
      const data = dataForGetProgram(1);
      const id = data[0].id;

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Program.deleteProgram(id)).rejects.toThrowError('a testing database error');

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "program" WHERE "id"=$1;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('Program.deleteProgram with no input', async () => {
      await expect(Program.deleteProgram()).rejects.toThrowError('ProgramId is required.');
    });
  });

  describe('Edit Programs', () => {
    beforeEach(() => {
      db.query.mockReset();
      db.query.mockResolvedValue(null);
    });

    test('Program.editProgram', async () => {
      const data = dataForGetProgram(1);
      const row = data[0];
      row.title = 'AMCS';
      row.description = 'Test program';
      const newValues = { title: row.title, description: row.description };

      db.query.mockResolvedValue({ rows: data });
      const program = await Program.editProgram(row.id, newValues);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "program" SET "title"=$2, "description"=$3 WHERE "id"=$1 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
      expect(db.query.mock.calls[0][1][1]).toBe(row.title);
      expect(db.query.mock.calls[0][1][2]).toBe(row.description);
      for (const key in Object.keys(row)) {
        expect(program).toHaveProperty(key, row[key]);
      }
    });

    test('Program.editProgram with some values not valid', async () => {
      const data = dataForGetProgram(1);
      const row = data[0];
      row.title = 'AMCS';
      row.description = 'Test program';
      const newValues = {
        title: 'AMCS',
        description: 'Test program',
        foo: 'bar',
        bar: 'foo',
        not_valid: 'more_not_valid_stuff',
      };

      db.query.mockResolvedValue({ rows: [] });
      await expect(Program.editProgram(row.id, newValues)).resolves.toBe(undefined);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "program" SET "title"=$2, "description"=$3 WHERE "id"=$1 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
      expect(db.query.mock.calls[0][1][1]).toBe(row.title);
      expect(db.query.mock.calls[0][1][2]).toBe(row.description);
    });

    test('Program.editProgram with database error', async () => {
      const data = dataForGetProgram(1);
      const row = data[0];
      row.title = 'AMCS';
      row.description = 'Test program';
      const newValues = { title: row.title, description: row.description };

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Program.editProgram(row.id, newValues)).rejects.toThrowError(
        'a testing database error'
      );

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "program" SET "title"=$2, "description"=$3 WHERE "id"=$1 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
      expect(db.query.mock.calls[0][1][1]).toBe(row.title);
      expect(db.query.mock.calls[0][1][2]).toBe(row.description);
    });

    test('Program.editProgram with bad input', async () => {
      await expect(Program.editProgram('id', 'bad input')).rejects.toThrowError('Id is required.');
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('Program.edit with no input', async () => {
      await expect(Program.editProgram()).rejects.toThrowError('Id is required.');
      expect(db.query.mock.calls).toHaveLength(0);
    });
  });
});
