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
      await expect(Term.findOne()).rejects.toThrowError('Backend service received bad data!');
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

    test('Inputting null parameters', async () => {
      await expect(doAdd(null)).rejects.toThrowError('Backend service received bad data!');
      expect(db.query).not.toBeCalled();
    });

    test('Inputting undefined', async () => {
      await expect(doAdd()).rejects.toThrowError('Backend service received bad data!');
      expect(db.query).not.toBeCalled();
    });

    test('Unexpected DB condition', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      const term = dataForGetTerm(1)[0];
      await expect(
        Term.addTerm({ title: term.title, startyear: term.startyear, semester: term.semester })
      ).rejects.toThrowError('Unexpected DB condition: success, but no data returned');
      expect(db.query).toBeCalled();
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
    test('Unexpected condition, no return', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(Term.count()).rejects.toThrowError(
        'Unexpected DB condition: success, but no data returned'
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "term"`);
    });
  });
});

describe('editing a term', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  test('Term.edit', async () => {
    const data = dataForGetTerm(1);
    const row = data[0];
    row.semester = 2;
    row.startyear = 2021;
    const newValues = { semester: row.semester, startyear: row.startyear };

    db.query.mockResolvedValue({ rows: data });
    const term = await Term.edit(row.id, newValues);

    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      'UPDATE "term" SET "semester"=$2, "startyear"=$3 WHERE "id"=$1 RETURNING *;'
    );
    expect(db.query.mock.calls[0][1]).toHaveLength(3);
    expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    expect(db.query.mock.calls[0][1][1]).toBe(row.semester);
    expect(db.query.mock.calls[0][1][2]).toBe(row.startyear);
    for (const key in Object.keys(row)) {
      expect(term).toHaveProperty(key, row[key]);
    }
  });

  test('Term.edit with database error', async () => {
    const data = dataForGetTerm(1);
    const row = data[0];
    row.semester = 2;
    row.startyear = 2021;
    const newValues = { semester: row.semester, startyear: row.startyear };

    // error thrown during call to db query
    db.query.mockRejectedValueOnce(new Error('a testing database error'));
    await expect(Term.edit(row.id, newValues)).rejects.toThrowError('a testing database error');

    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      'UPDATE "term" SET "semester"=$2, "startyear"=$3 WHERE "id"=$1 RETURNING *;'
    );
    expect(db.query.mock.calls[0][1]).toHaveLength(3);
    expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    expect(db.query.mock.calls[0][1][1]).toBe(row.semester);
    expect(db.query.mock.calls[0][1][2]).toBe(row.startyear);
  });

  test('Term.edit with bad input', async () => {
    db.query.mockResolvedValueOnce({ data: [] });
    await expect(Term.edit('id', null)).rejects.toThrowError('Backend service received bad data!');
    expect(db.query.mock.calls).toHaveLength(0);
  });

  test('Term.edit with no input', async () => {
    await expect(Term.edit()).rejects.toThrowError('Backend service received bad data!');
    expect(db.query.mock.calls).toHaveLength(0);
  });

  test('Term.edit with empty database answer', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    await expect(Term.edit(1, { semester: 2, startyear: 2021 })).rejects.toThrowError(
      'Unexpected DB condition: success, but no data returned'
    );
    expect(db.query.mock.calls[0][1]).toHaveLength(3);
    expect(db.query.mock.calls[0][1][0]).toBe(1);
    expect(db.query.mock.calls[0][1][1]).toBe(2);
    expect(db.query.mock.calls[0][1][2]).toBe(2021);
  });

  describe('Delete Terms', () => {
    test('Delete a Term', async () => {
      const data = dataForGetTerm(1);
      const termId = data[0].id;

      db.query.mockResolvedValue({ rows: data });
      const deleteTerm = await Term.deleteTerm(termId);

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('DELETE FROM "term" WHERE "id"=$1 RETURNING *;');
      expect(db.query.mock.calls[0][1]).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(termId);
      expect(deleteTerm).toEqual(data[0]);
    });
    test('Term.deleteTerm with no input', async () => {
      await expect(Term.deleteTerm()).rejects.toThrowError('Backend service received bad data!');
    });
  });
});
