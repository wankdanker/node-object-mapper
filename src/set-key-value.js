'use strict';

/**
 * Make the set of a value withing the key in the passed object
 * @param object
 * @param key
 * @param value
 * @returns {*|{}}
 */
function SetKeyValue(object, key, value) {
  var regDot = /\./g
    , next
    , keyRest
    ;

  object = object || {};

  if (regDot.test(key)) {
    next = key.indexOf('.');
    keyRest = key.substring(next + 1);
    key = key.substring(0, next);

    _setValue(object, key, SetKeyValue(object[key], keyRest, value));
  } else {
    _setValue(object, key, value);
  }

  return object;
}
module.exports = SetKeyValue;

/**
 * Set the value within the passed object, considering if is a array or object set
 * @param object
 * @param key
 * @param value
 * @returns {*}
 * @private
 * @recursive
 */
function _setValue(object, key, value) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , arrayIndex
    , valueKey;

  if (regArray.test(key)) {
    regArray.lastIndex = 0;
    arrayIndex = regArray.exec(key)[2];
    key = key.replace(regArray, '');

    if (typeof object[key] === 'undefined') {
      object[key] = [];
    }

    if (Number.isNaN(arrayIndex)) {
      arrayIndex = _undefined;
    }
    if (typeof arrayIndex === 'undefined') {
      arrayIndex = 0;
    }
    if (typeof object[key][arrayIndex] === 'undefined') {
      object[key][arrayIndex] = {};
    }
    if (typeof value === 'object') {
      valueKey = Object.keys(value)[0];
      if (value.hasOwnProperty(valueKey)) {
        object[key][arrayIndex][valueKey] = value[valueKey];
      }
    } else {
      object[key][arrayIndex] = value;
    }
  } else {
    object[key] = value;
  }
  return object[key];
}