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
    , arrayIndex;

  if (regArray.test(key)) {
    regArray.lastIndex = 0;
    arrayIndex = regArray.exec(key)[2];
    key = key.replace(regArray, '');

    if (Number.isNaN(arrayIndex)) {
      arrayIndex = _undefined;
    }
    if (typeof arrayIndex === 'undefined') {
      return object[key];
    } else {
      return object[key][arrayIndex];
    }
  } else if (object && object.hasOwnProperty(key)) {
    return object[key];
  } else {
    return null;
  }
}