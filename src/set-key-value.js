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

    object = _setValue(object, key, SetKeyValue(object[key], keyRest, value));
  } else {
    object = _setValue(object, key, value);
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
    , tmpObject
    ;

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
    if (Array.isArray(value)) {
      value.forEach(function (item, index) {
        _initializeObjectProperty(object, key, index);
        _setValueFromObject(item, object, key, index);
      })
    } else {
      _initializeObjectProperty(object, key, arrayIndex);
      if (typeof value === 'object') {
        _setValueFromObject(value, object, key, arrayIndex);
      } else {
        object[key][arrayIndex] = value;
      }
    }

  } else if (Array.isArray(value)) {
    return value.map(function (valueItem) {
      tmpObject = {};
      tmpObject[key] = valueItem;
      return tmpObject;
    });
  } else {
    object[key] = value;
  }
  return object;
}

function _initializeObjectProperty(object, key, index) {
  if (typeof object[key][index] === 'undefined') {
    object[key][index] = {};
  }
}

function _setValueFromObject(value, object, key, index) {
  var valueKey = Object.keys(value)[0];
  if (value.hasOwnProperty(valueKey)) {
    object[key][index][valueKey] = value[valueKey];
  }
}