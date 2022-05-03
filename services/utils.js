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
/**
 * Condences object to only include specific key value pairs
 * @param  {Object} object Key Value Object
 * @param  {Array} ...keys Keys to extract from object
 * 
 * @returns {Object} Final condenced object 
 */
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
