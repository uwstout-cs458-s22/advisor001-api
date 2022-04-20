const { joiner, validator } = require('./schematools.js');

describe('Schema tools tests', () => {
  describe('Joiner tests', () => {
    describe('User table', () => {
      test('Email', () => {
        expect(validator.user.email()).toBeTruthy();
        expect(validator.user.email('foo')).toBeTruthy();

        expect(validator.user.email(3)).toBeFalsy();
        expect(validator.user.email(true)).toBeFalsy();
      });
    });
  });

  describe('Validator tests', () => {});
});
