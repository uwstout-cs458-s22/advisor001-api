global.jest.init(false); // Init without models
global.jest.init_db();

const { db, dataForGetCourse } = global.jest;
const { findOne, findAll, addProgramCourse, deleteProgramCourse } = require('./ProgramCourse');

describe('Tests for programs course', () => {
  const dummy = dataForGetCourse(1)[0];

  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue({ rows: [dummy] });
  });

  describe('ProgramCourse.findOne', () => {
    test('If the criteria is bad', async () => {
      const err = 'Id is required.';
      await expect(findOne(0)).rejects.toThrowError(err);
      await expect(findOne(null)).rejects.toThrowError(err);
      await expect(findOne(false)).rejects.toThrowError(err);
      await expect(findOne(undefined)).rejects.toThrowError(err);
      await expect(findOne('')).rejects.toThrowError(err);
      await expect(findOne({})).rejects.toThrowError(err);
    });

    test('If the criteria is not bad and there are rows', async () => {
      await expect(findOne({ program: '123', requires: '456' })).resolves.toBe(dummy);
    });

    test('If the criteria is not bad and there are NO rows', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(findOne({ program: '123', requires: '456' })).resolves.toEqual({});
    });
  });

  describe('ProgramCourse.findAll', () => {
    test('If the criteria is bad', async () => {
      const err = 'Program Id is required.';
      await expect(findAll(0)).rejects.toThrowError(err);
      await expect(findAll(null)).rejects.toThrowError(err);
      await expect(findAll(false)).rejects.toThrowError(err);
      await expect(findAll(undefined)).rejects.toThrowError(err);
      await expect(findAll('')).rejects.toThrowError(err);
      await expect(findAll({})).rejects.toThrowError(err);
    });

    test('If the criteria is not bad and there are rows', async () => {
      await expect(findAll({ program: '123' })).resolves.toBe(dummy);
    });

    test('If the criteria is not bad and there are NO rows', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(findAll({ program: '123' })).resolves.toEqual({});
    });
  });

  describe('ProgramCourse.addProgramCourse', () => {
    test('If the criteria is bad', async () => {
      const err = 'Missing Parameters';
      await expect(addProgramCourse(0)).rejects.toThrowError(err);
      await expect(addProgramCourse(null)).rejects.toThrowError(err);
      await expect(addProgramCourse(false)).rejects.toThrowError(err);
      await expect(addProgramCourse(undefined)).rejects.toThrowError(err);
      await expect(addProgramCourse('')).rejects.toThrowError(err);
      await expect(addProgramCourse({})).rejects.toThrowError(err);
    });

    test('If the criteria is not bad and the insert works', async () => {
      await expect(addProgramCourse({ program: '123', requires: '456' })).resolves.toBe(dummy);
    });

    test('If the criteria is not bad, but DB throws error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing error'));
      await expect(addProgramCourse({ program: '123', requires: '456' })).rejects.toThrowError(
        'a testing error'
      );
    });

    test('If the insert was successful, but DB returns nothing', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(addProgramCourse({ program: '123', requires: '456' })).rejects.toThrowError(
        'Unexpected DB Condition, insert sucessful with no returned record'
      );
    });
  });
});
