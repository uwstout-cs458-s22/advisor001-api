global.jest.init(false);
global.jest.init_db();

const { db } = global.jest;
const Term = require('./Term');

describe('Course Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });
  describe('Count Courses', () => {
    test('One Course in the Database', async () => {
      db.query.mockResolvedValue({ rows: [{ count: 1 }] });
      const res = await Term.count();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(`SELECT COUNT(*) FROM "term"`);
      expect(res).toHaveProperty('count', 1);
    });
  });
});
