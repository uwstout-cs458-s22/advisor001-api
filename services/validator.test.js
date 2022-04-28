const validate = require('./validator');

// good and bad for each
const tests = global.jest.goodBadData;
const allOfOurTables = Object.keys(tests);

describe('Validator tests', () => {
  test('Make sure they generated properly', () => {
    for (const tableName of allOfOurTables) {
      expect(validate).toHaveProperty(tableName);
      expect(validate[tableName]).not.toBeFalsy();
    }
  });

  test.each(allOfOurTables)('Validator for table: %p', (tableName) => {
    // test all good
    const validator = validate[tableName];
    const good = tests[tableName].good;
    const bad = tests[tableName].bad;

    // test all good
    expect(validator(good)).toEqual(good);
    // test all bad
    expect(validator(bad)).toBeFalsy();

    // it should treat 0 params and empty objects the same
    const answers = [validator(), validator({})];
    expect(answers[0]).toEqual(answers[1]);

    const properties = Object.keys(validator);
    expect(properties.length).toBeGreaterThan(0);

    // test only one bad property at a time
    for (const prop of properties) {
      // make one bad
      const goodExceptOne = Object.assign({}, good);
      goodExceptOne[prop] = bad[prop];
      // test
      expect(validator(goodExceptOne)).toBeFalsy();
    }

    // test only one property
    for (const prop of properties) {
      const singlePropValidator = validator[prop];
      expect(singlePropValidator(good[prop])).toBeTruthy();
      expect(singlePropValidator(bad[prop])).toBeFalsy();
    }
  });
});
