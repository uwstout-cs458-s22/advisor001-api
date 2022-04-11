const { isEmpty, isArray, isObject, isNumber, extractKeys } = require('./utils');

describe('utils Tests', () => {
  test('isArray tests', async () => {
    expect(isArray()).toBeFalsy(); // false
    expect(isArray(null)).toBeFalsy(); // false
    expect(isArray(true)).toBeFalsy(); // false
    expect(isArray(1)).toBeFalsy(); // false
    expect(isArray('str')).toBeFalsy(); // false
    expect(isArray({})).toBeFalsy(); // false
    expect(isArray(new Date())).toBeFalsy(); // false
    expect(isArray([])).toBeTruthy(); // true
  });
  test('isObject tests', async () => {
    expect(isObject()).toBeFalsy(); // false
    expect(isObject(null)).toBeFalsy(); // false
    expect(isObject(true)).toBeFalsy(); // false
    expect(isObject(1)).toBeFalsy(); // false
    expect(isObject('str')).toBeFalsy(); // false
    expect(isObject([])).toBeFalsy(); // false
    expect(isObject(new Date())).toBeFalsy(); // false
    expect(isObject({})).toBeTruthy(); // true
  });
  test('isEmpty tests', async () => {
    expect(isEmpty()).toBeFalsy(); // false
    expect(isEmpty(null)).toBeFalsy(); // false
    expect(isEmpty(true)).toBeFalsy(); // false
    expect(isEmpty(1)).toBeFalsy(); // false
    expect(isEmpty('str')).toBeFalsy(); // false
    expect(isEmpty([])).toBeFalsy(); // false
    expect(isEmpty(new Date())).toBeFalsy(); // false
    expect(isEmpty({ a: 1 })).toBeFalsy(); // false
    expect(isEmpty({})).toBeTruthy(); // true
  });
  test('isNumber tests', async () => {
    expect(isNumber()).toBeFalsy(); // false
    expect(isNumber(null)).toBeFalsy(); // false
    expect(isNumber(true)).toBeFalsy(); // false
    expect(isNumber(1)).toBeTruthy(); // true
    expect(isNumber('1')).toBeFalsy(); // false
    expect(isNumber([])).toBeFalsy(); // false
    expect(isNumber(new Date())).toBeFalsy(); // false
    expect(isNumber({ a: 1 })).toBeFalsy(); // false
    expect(isNumber({})).toBeFalsy(); // false
  });
  test('extractKeys tests', async () => {
    const obj = {
      foo1: 'bar1',
      foo2: 'bar2',
      foo3: 'bar3',
      foo4: 'bar4',
      foo5: 'bar5',
    };
    const props = ['foo2', 'foo3', 'foo5', 'foo6', 'foo7'];
    const result = extractKeys(obj, ...props);
    expect(result).not.toHaveProperty('foo1');
    expect(result).toHaveProperty('foo2', obj.foo2);
    expect(result).toHaveProperty('foo3', obj.foo3);
    expect(result).not.toHaveProperty('foo4');
    expect(result).toHaveProperty('foo5', obj.foo5);
    expect(result).not.toHaveProperty('foo6');
    expect(result).not.toHaveProperty('foo7');
  });
});
