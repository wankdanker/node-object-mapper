'use strict';

/**
 * Make the set of a value withing the key in the passed object
 * @param baseObject
 * @param destinationKey
 * @param fromValue
 * @returns {*|{}}
 */
function SetKeyValue(baseObject, destinationKey, fromValue) {
  var regDot = /\./g
    , keys
    , key
    ;

  keys = destinationKey.split(regDot);
  key = keys.splice(0, 1);

  return _setValue(baseObject, key[0], keys, fromValue);
}
module.exports = SetKeyValue;

/**
 * Set the value within the passed object, considering if is a array or object set
 * @param destinationObject
 * @param key
 * @param keys
 * @param fromValue
 * @returns {*}
 * @private
 * @recursive
 */
function _setValue(destinationObject, key, keys, fromValue) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , match
    , arrayIndex = 0
    , valueIndex
    , isPropertyArray = false
    , isValueArray = false
    , value
    ;

  match = regArray.exec(key);
  if (match) {
    isPropertyArray = true;
    key = key.replace(regArray, '');
    isValueArray = (key !== '');
  }

  if (_isEmpty(destinationObject)) {
    if (isPropertyArray) {
      arrayIndex = match[2] || 0;
      if (isValueArray) {
        destinationObject = {};
        destinationObject[key] = [];
      } else {
        destinationObject = [];
      }
    } else {
      destinationObject = {};
    }
  } else {
    destinationObject = JSON.parse(JSON.stringify(destinationObject));
    if (isPropertyArray) {
      arrayIndex = match[2] || destinationObject.length || 0;
    }
  }
  if (keys.length === 0) {
    if (isValueArray) {
      if (Array.isArray(destinationObject[key]) === false) {
        destinationObject[key] = [];
      }
      destinationObject[key][arrayIndex] = fromValue;
    } else if (Array.isArray(destinationObject)) {
      destinationObject[arrayIndex] = fromValue;
    } else {
      destinationObject[key] = fromValue;
    }
  } else {
    if (isValueArray) {
      if (Array.isArray(destinationObject[key]) === false) {
        destinationObject[key] = [];
      }
      if (Array.isArray(fromValue) && _isNextArrayProperty(keys) === false) {
        for (valueIndex = 0; valueIndex < fromValue.length; valueIndex++) {
          value = fromValue[valueIndex];
          destinationObject[key][arrayIndex + valueIndex] = _setValue(destinationObject[key][arrayIndex + valueIndex], keys[0], keys.slice(1), value);
        }
      } else {
        destinationObject[key][arrayIndex] = _setValue(destinationObject[key][arrayIndex], keys[0], keys.slice(1), fromValue);
      }
    } else if (Array.isArray(destinationObject)) {
      if (Array.isArray(fromValue)) {
        for (valueIndex = 0; valueIndex < fromValue.length; valueIndex++) {
          value = fromValue[valueIndex];
          destinationObject[arrayIndex] = _setValue(destinationObject[arrayIndex], keys[0], keys.slice(1), value);
        }
      } else {
        destinationObject[arrayIndex] = _setValue(destinationObject[arrayIndex], keys[0], keys.slice(1), fromValue);
      }
    } else {
      destinationObject[key] = _setValue(destinationObject[key], keys[0], keys.slice(1), fromValue);
    }
  }


  return destinationObject;
}

function _isNextArrayProperty(keys) {
  var regArray = /(\[\]|\[(.*)\])$/g
    ;
  return regArray.test(keys[0]);
}

function _isEmpty(object) {
  var empty = false;
  if (typeof object === 'undefined' || object === null) {
    empty = true;
  } else if (_isEmptyObject(object)) {
    empty = true;
  } else if (_isEmptyArray(object)) {
    empty = true;
  }

  return empty;
}
function _isEmptyObject(object) {
  return typeof object === 'object'
    && Array.isArray(object) === false
    && Object.keys(object).length === 0
    ;
}
function _isEmptyArray(object) {
  return Array.isArray(object)
    && (object.length === 0
    || object.join('').length === 0)
    ;
}