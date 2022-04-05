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
});
