function isEmpty(value) {
  return isObject(value) && Object.keys(value).length === 0;
}

function isArray(a) {
  return !!a && a.constructor === Array;
}

function isObject(a) {
  return !!a && a.constructor === Object;
}

function isString(a) {
  return typeof a === 'string' || a instanceof String;
}

function isNumber(a) {
  return typeof a === 'number' || a instanceof Number;
}

function extractKeys(object, ...keys) {
  const result = {};
  for (const key of keys) {
    if (key in object && object[key] !== undefined) {
      result[key] = object[key];
    }
  }
  return result;
}

module.exports = {
  isEmpty,
  isArray,
  isObject,
  isString,
  isNumber,
  extractKeys,
};
