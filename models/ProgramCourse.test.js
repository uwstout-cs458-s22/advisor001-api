global.jest.init(false); // Init without models
global.jest.init_db();

const { db, dataForGetCourse, dataForGetProgram } = global.jest;
const {
  findOne,
  findAll,
  addProgramCourse,
  deleteProgramCourse,
  editProgramCourse,
} = require('./ProgramCourse');

describe('Tests for programs course', () => {
  const dummy = dataForGetCourse(1)[0];
  const dummyProgram = dataForGetProgram(1)[0];

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

  describe('ProgramCourse.deleteProgramCourse', () => {
    const dummy = {
      id: '123',
      program: '456',
      requires: '789',
    };

    beforeEach(() => {
      db.query.mockResolvedValue({ rows: [dummy] });
    });

    test('If it exists and is deleted', async () => {
      await expect(deleteProgramCourse(dummy.program, dummy.requires)).resolves.toBe(true);
    });

    test('If it exists and is deleted, but no DB return', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(deleteProgramCourse(dummy.program, dummy.requires)).resolves.toBe(undefined);
    });

    test('If there is a DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing error'));
      await expect(deleteProgramCourse(dummy.program, dummy.requires)).rejects.toThrowError(
        'a testing error'
      );
    });

    test('If required parameters are missing', async () => {
      const expected = expect.objectContaining({
        statusCode: 400,
        message: 'Missing Parameters',
      });
      await expect(deleteProgramCourse(dummy.program, '')).rejects.toEqual(expected);
      await expect(deleteProgramCourse('', dummy.requires)).rejects.toEqual(expected);
      await expect(deleteProgramCourse('', '')).rejects.toEqual(expected);
      await expect(deleteProgramCourse(dummy.program, undefined)).rejects.toEqual(expected);
      await expect(deleteProgramCourse(undefined, dummy.requires)).rejects.toEqual(expected);
      await expect(deleteProgramCourse(dummy.program)).rejects.toEqual(expected);
      await expect(deleteProgramCourse()).rejects.toEqual(expected);
    });
  });

  describe('ProgramCourse.editProgramCourse', () => {
    test('Successful edit', async () => {
      db.query.mockResolvedValue({ rows: [dummyProgram] });

      await expect(
        editProgramCourse(Number.parseInt(dummyProgram.id), Number.parseInt(dummy.id))
      ).resolves.toBe(dummyProgram);
    });

    test('Missing parameters', async () => {
      const err = 'Missing Parameters';

      await expect(editProgramCourse(0, 0)).rejects.toThrowError(err);
      await expect(editProgramCourse(null, null)).rejects.toThrowError(err);
      await expect(editProgramCourse(false, false)).rejects.toThrowError(err);
      await expect(editProgramCourse(undefined, undefined)).rejects.toThrowError(err);
      await expect(editProgramCourse('', '')).rejects.toThrowError(err);
      await expect(editProgramCourse({}, {})).rejects.toThrowError(err);
      await expect(editProgramCourse()).rejects.toThrowError(err);
    });

    test('Invalid parameters', async () => {
      const err = 'Invalid Parameters';

      await expect(editProgramCourse(true, true)).rejects.toThrowError(err);
      await expect(editProgramCourse('string', 'string')).rejects.toThrowError(err);
      await expect(
        editProgramCourse({ key: 'property' }, { key: 'property' })
      ).rejects.toThrowError(err);
    });
  });
});
