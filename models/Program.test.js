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
});
