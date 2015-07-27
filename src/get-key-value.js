'use strict';

/**
 * Make the get of a value with the key in the passed object
 * @param object
 * @param key
 * @returns {*}
 */
function GetKeyValue(object, key) {
  var regDot = /\./g
    , next
    , keyRest
    ;

  if (regDot.test(key)) {
    next = key.indexOf('.');
    keyRest = key.substring(next + 1);
    key = key.substring(0, next);

    return GetKeyValue(_getValue(object, key), keyRest);
  } else {
    return _getValue(object, key);
  }
}

module.exports = GetKeyValue;

/**
 * Get the value of key within passed object, considering if there is a array or object
 * @param object
 * @param key
 * @returns {*}
 * @private
 * @recursive
 */
function _getValue(object, key) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , arrayIndex
    , result;

  if (Array.isArray(object) && object.length) {
    result = object.map(function (item) {
      return GetKeyValue(item, key);
    });
  } else if (regArray.test(key)) {
    regArray.lastIndex = 0;
    arrayIndex = regArray.exec(key)[2];
    key = key.replace(regArray, '');

    if (Number.isNaN(arrayIndex)) {
      arrayIndex = _undefined;
    }
    if (typeof arrayIndex === 'undefined') {
      result = object[key];
    } else {
      result = object[key][arrayIndex];
    }
  } else if (object && object.hasOwnProperty(key)) {
    result = object[key];
  } else {
    result = null;
  }

  if (Array.isArray(result)) {
    result = result.reduce(function (a, b) {
      if (Array.isArray(a) && Array.isArray(b)) {
        return a.concat(b);
      }
      return [a, b];
    });
    if (!Array.isArray(result)) {
      result = [result];
    }
  }

  return result;
}