const {
  isEmpty,
  isArray,
  isObject,
  isString,
  isNumber,
  isBoolean,
  isNully,
  extractKeys,
  renameKeys,
} = require('./utils');

describe('utils Tests', () => {
  test('isEmpty tests', async () => {
    expect(isEmpty({})).toBeTruthy(); // true

    expect(isEmpty()).toBeFalsy(); // false
    expect(isEmpty(null)).toBeFalsy(); // false
    expect(isEmpty(true)).toBeFalsy(); // false
    expect(isEmpty(1)).toBeFalsy(); // false
    expect(isEmpty('str')).toBeFalsy(); // false
    expect(isEmpty([])).toBeFalsy(); // false
    expect(isEmpty(new Date())).toBeFalsy(); // false
    expect(isEmpty({ a: 1 })).toBeFalsy(); // false
  });
  test('isArray tests', async () => {
    expect(isArray([])).toBeTruthy(); // true

    expect(isArray()).toBeFalsy(); // false
    expect(isArray(null)).toBeFalsy(); // false
    expect(isArray(true)).toBeFalsy(); // false
    expect(isArray(1)).toBeFalsy(); // false
    expect(isArray('str')).toBeFalsy(); // false
    expect(isArray({})).toBeFalsy(); // false
    expect(isArray(new Date())).toBeFalsy(); // false
  });
  test('isObject tests', async () => {
    expect(isObject({})).toBeTruthy(); // true

    expect(isObject()).toBeFalsy(); // false
    expect(isObject(null)).toBeFalsy(); // false
    expect(isObject(true)).toBeFalsy(); // false
    expect(isObject(1)).toBeFalsy(); // false
    expect(isObject('str')).toBeFalsy(); // false
    expect(isObject([])).toBeFalsy(); // false
    expect(isObject(new Date())).toBeFalsy(); // false
  });
  test('isString tests', async () => {
    expect(isString('str')).toBeTruthy();
    expect(isString('')).toBeTruthy();
    expect(isString(`${((x) => x)()}`)).toBeTruthy();
    expect(isString(JSON.stringify({}))).toBeTruthy();

    expect(isString()).toBeFalsy();
    expect(isString(undefined)).toBeFalsy();
    expect(isString(null)).toBeFalsy();
    expect(isString(true)).toBeFalsy();
    expect(isString(1)).toBeFalsy();
    expect(isString([])).toBeFalsy();
    expect(isString(new Date())).toBeFalsy();
    expect(isString({})).toBeFalsy();
  });
  test('isNumber tests', async () => {
    expect(isNumber(1)).toBeTruthy();
    expect(isNumber(0)).toBeTruthy();
    expect(isNumber(8192 / 16384)).toBeTruthy();

    expect(isNumber()).toBeFalsy();
    expect(isNumber(null)).toBeFalsy();
    expect(isNumber(true)).toBeFalsy();
    expect(isNumber('1')).toBeFalsy();
    expect(isNumber([])).toBeFalsy();
    expect(isNumber(new Date())).toBeFalsy();
    expect(isNumber({ a: 1 })).toBeFalsy();
    expect(isNumber({})).toBeFalsy();
  });
  test('isBoolean tests', async () => {
    expect(isBoolean(true)).toBeTruthy();
    expect(isBoolean(false)).toBeTruthy();
    expect(isBoolean(isBoolean(true))).toBeTruthy();
    expect(isBoolean(isBoolean(isBoolean(false)))).toBeTruthy();
    expect(isBoolean(isBoolean(isBoolean(isBoolean(undefined))))).toBeTruthy();

    expect(isBoolean()).toBeFalsy();
    expect(isBoolean(undefined)).toBeFalsy();
    expect(isBoolean(null)).toBeFalsy();
    expect(isBoolean(1)).toBeFalsy();
    expect(isBoolean('str')).toBeFalsy();
    expect(isBoolean([])).toBeFalsy();
    expect(isBoolean(new Date())).toBeFalsy();
    expect(isBoolean({})).toBeFalsy();
  });
  test('isNully tests', async () => {
    let x;
    expect(isNully()).toBeTruthy(); // true
    expect(isNully(x)).toBeTruthy(); // true
    expect(isNully(undefined)).toBeTruthy(); // true
    expect(isNully(null)).toBeTruthy(); // true

    expect(isNully(true)).toBeFalsy();
    expect(isNully(false)).toBeFalsy();
    expect(isNully(1)).toBeFalsy();
    expect(isNully(0)).toBeFalsy();
    expect(isNully('1')).toBeFalsy();
    expect(isNully('0')).toBeFalsy();
    expect(isNully([])).toBeFalsy();
    expect(isNully(new Date())).toBeFalsy();
    expect(isNully({ a: 1 })).toBeFalsy();
    expect(isNully({})).toBeFalsy();
    expect(isNully(isNully(null))).toBeFalsy();
  });
  test('extractKeys tests', async () => {
    const obj = {
      foo1: 'bar1',
      foo2: 'bar2', // IN LIST
      foo3: 'bar3', // IN LIST
      foo4: 'bar4',
      foo5: 'bar5', // IN LIST
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
    // only extract 3 keys
    expect(result).toStrictEqual({
      foo2: obj.foo2,
      foo3: obj.foo3,
      foo5: obj.foo5,
    });
    // not the same as assigning everything
    expect(result).not.toStrictEqual({
      foo2: obj.foo2,
      foo3: obj.foo3,
      foo5: obj.foo5,
      foo6: obj.foo6,
      foo7: obj.foo7,
    });
  });

  test('renameKeys tests', async () => {
    const obj = {
      foo1: 'bar1',
      foo2: 'bar2', // IN MAP
      foo3: 'bar3', // IN MAP
      foo4: 'bar4',
      foo5: 'bar5', // IN MAP
      foo6: undefined,
    };
    const keyMap = {
      foo2: 'newFoo2', // IN OBJ
      foo3: 'newFoo3', // IN OBJ
      foo5: 'newFoo5', // IN OBJ
      foo6: 'newFoo6',
      foo7: 'newFoo7',
    };
    const result = renameKeys(obj, keyMap);
    // --
    expect(result).toHaveProperty('foo1', obj.foo1);
    // -- renamed --
    expect(result).not.toHaveProperty('foo2');
    expect(result).toHaveProperty('newFoo2', obj.foo2);
    // -- renamed --
    expect(result).not.toHaveProperty('foo3');
    expect(result).toHaveProperty('newFoo3', obj.foo3);
    // --
    expect(result).toHaveProperty('foo4', obj.foo4);
    // -- renamed --
    expect(result).not.toHaveProperty('foo5');
    expect(result).toHaveProperty('newFoo5', obj.foo5);
    // -- rule exists but no matching key --
    expect(result).not.toHaveProperty('foo6');
    expect(result).not.toHaveProperty('newFoo6');
    expect(result).not.toHaveProperty('foo7');
    expect(result).not.toHaveProperty('newFoo7');

    // prettier-ignore
    expect(result).toStrictEqual({
      foo1:     obj.foo1,
      newFoo2:  obj.foo2, // renamed
      newFoo3:  obj.foo3, // renamed
      foo4:     obj.foo4,
      newFoo5:  obj.foo5, // renamed
    });
  });
});
