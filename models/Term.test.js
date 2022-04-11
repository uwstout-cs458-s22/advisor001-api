global.jest.init(false); // Init without models
global.jest.init_db();
const { dataForGetTerm, db } = global.jest;

const Term = require('./Term');

describe('Term Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('querying a single term by id', () => {
    test('confirm calls to query', async () => {
      const data = dataForGetTerm(1);
      const id = data[0].id;

      db.query.mockResolvedValue({ rows: data });
      await Term.findOne({ id });

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(id);
    });

    test('should return a single term', async () => {
      const row = dataForGetTerm(1)[0];
      const id = row.id;

      db.query.mockResolvedValue({ rows: [row] });
      const term = await Term.findOne({ id });

      for (const key in Object.keys(row)) {
        expect(term).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound term', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const term = await Term.findOne({ id: 123 });

      expect(Object.keys(term)).toHaveLength(0);
    });

    test('should throw error for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Term.findOne({ id: 123 })).rejects.toThrowError('a testing database error');
    });

    test('should throw error if no parameters', async () => {
      await expect(Term.findOne()).rejects.toThrowError('Id is required.');
    });
  });

  describe('querying groups of terms', () => {
    test('should make a call to Term.findAll - no criteria, no limits, no offsets', async () => {
      const data = dataForGetTerm(5);
      db.query.mockResolvedValueOnce({ rows: data });

      const terms = await Term.findAll();

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('SELECT * from "term"  LIMIT $1 OFFSET $2;');
      expect(db.query.mock.calls[0][1]).toHaveLength(2);
      expect(db.query.mock.calls[0][1][0]).toBe(100);
      expect(db.query.mock.calls[0][1][1]).toBe(0);
      expect(terms).toHaveLength(data.length);

      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(terms[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Term.findAll - with criteria, no limits, no offsets', async () => {
      const data = dataForGetTerm(5);
      db.query.mockResolvedValueOnce({ rows: data });
      const terms = await Term.findAll({ semester: 3 }, undefined);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "term" WHERE "semester"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(3);
      expect(db.query.mock.calls[0][1][1]).toBe(100);
      expect(db.query.mock.calls[0][1][2]).toBe(0);
      expect(terms).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(terms[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Term.findAll - with criteria, with limits, no offsets', async () => {
      const data = dataForGetTerm(3);
      db.query.mockResolvedValueOnce({ rows: data });
      const terms = await Term.findAll({ semester: 3 }, 5);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "term" WHERE "semester"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(3);
      expect(db.query.mock.calls[0][1][1]).toBe(5);
      expect(db.query.mock.calls[0][1][2]).toBe(0);
      expect(terms).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(terms[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to Term.findAll - with criteria, with limits, with offsets', async () => {
      const data = dataForGetTerm(3, 1);
      db.query.mockResolvedValueOnce({ rows: data });
      const terms = await Term.findAll({ semester: 3 }, 5, 1);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "term" WHERE "semester"=$1 LIMIT $2 OFFSET $3;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(3);
      expect(db.query.mock.calls[0][1][1]).toBe(5);
      expect(db.query.mock.calls[0][1][2]).toBe(1);
      expect(terms).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(terms[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Term.findAll()).rejects.toThrowError('a testing database error');
    });
  });

  describe('Adding term', () => {
    // helper that to do the add
    function doAdd(newTerm) {
      db.query.mockResolvedValueOnce({ rows: [newTerm] });
      return Term.addTerm(newTerm);
    }

    test('Adding single term success', async () => {
      const data = dataForGetTerm(1)[0];
      const term = await doAdd(data);
      for (const key of Object.keys(data)) {
        expect(term).toHaveProperty(key, data[key]);
      }
    });

    test('Inputting invalid value', async () => {
      const term = dataForGetTerm(1)[0];
      term.title = { test: "object that's not string" };

      await expect(doAdd(term)).rejects.toThrowError(
        'Title, Start Year, and Semester are required.'
      );
    });

    test('Inputting null parameters', async () => {
      await expect(doAdd(null)).rejects.toThrowError(
        'Title, Start Year, and Semester are required.'
      );
      expect(db.query).not.toBeCalled();
    });

    test('Inputting empty object', async () => {
      await expect(doAdd({})).rejects.toThrowError('Title, Start Year, and Semester are required.');
      expect(db.query).not.toBeCalled();
    });
  });

  describe('Count Terms', () => {
    test('One Term in the Database', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
      const res = await Term.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "term"`);
      expect(res).toHaveProperty('count', 1);
    });
  });
});
