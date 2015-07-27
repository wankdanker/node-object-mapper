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

  recursiveCount = 0;
  return _setValue(baseObject, key[0], keys, fromValue);
}
module.exports = SetKeyValue;

var recursiveCount = 0;

function _setValue(destinationObject, key, keys, fromValue) {
  recursiveCount++;
  var regArray = /(\[\]|\[(.*)\])$/g
    , match
    , arrayIndex = 0
    , isPropertyArray = false
    , isValueArray = false
    ;

  console.log(recursiveCount, destinationObject, key, keys, fromValue);
  match = regArray.exec(key);
  if (match) {
    isPropertyArray = true;
    key = key.replace(regArray, '');
    isValueArray = (key !== '');
  }
  console.log(recursiveCount, 'isValueArray', isValueArray);
  console.log(recursiveCount, 'isPropertyArray', isPropertyArray);

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
      destinationObject[key][arrayIndex] = fromValue;
    } else if (Array.isArray(destinationObject)) {
      destinationObject[arrayIndex] = fromValue;
    } else {
      destinationObject[key] = fromValue;
    }
  } else {
    if (isValueArray) {
      console.log(recursiveCount, 'Property Array value', destinationObject, key, arrayIndex);
      destinationObject[key][arrayIndex] = _setValue(destinationObject[key][arrayIndex], keys[0], keys.slice(1), fromValue);
    } else if (Array.isArray(destinationObject)) {
      console.log(recursiveCount, 'Array value');
      destinationObject[arrayIndex] = _setValue(destinationObject[arrayIndex], keys[0], keys.slice(1), fromValue);
    } else {
      console.log(recursiveCount, 'Property value');
      destinationObject[key] = _setValue(destinationObject[key], keys[0], keys.slice(1), fromValue);
    }
  }

  return destinationObject;
}

function _isEmpty(object) {
  var empty = false;
  if (typeof destinationObject === 'undefined' || destinationObject === null) {
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

function SetKeyValueOld(object, key, value) {
  var regDot = /\./g
    , regArray = /(\[\]|\[(.*)\])$/g
    , next
    , keyRest
    ;

  console.log('>', object, key, value);

  object = object || {};

  if (regDot.test(key)) {
    next = key.indexOf('.');
    keyRest = key.substring(next + 1);
    key = key.substring(0, next);

    if (Array.isArray(object)) {
      object = object.map(function (item) {
        return _setValueOld(item, key, SetKeyValueOld(item, keyRest, value));
      });
    } else {
      object = _setValueOld(object, key, SetKeyValueOld(object[key.replace(regArray, '')], keyRest, value));
    }
  } else {
    object = _setValueOld(object, key, value);
  }

  return object;
}

/**
 * Set the value within the passed object, considering if is a array or object set
 * @param object
 * @param key
 * @param value
 * @returns {*}
 * @private
 * @recursive
 */
function _setValueOld(object, key, value) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , arrayIndex
    , tmpObject
    ;

  console.log('>>', object, key, value);

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
    _initializeObjectProperty(object, key, arrayIndex);
    _setValueFromObject(value, object, key, arrayIndex);
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
  var valueKey;
  if (Array.isArray(value)) {
    value.forEach(function (item, index) {
      _initializeObjectProperty(object, key, index);
      _setValueFromObject(item, object, key, index);
    });
  } else {
    if (typeof value === 'object') {
      for (valueKey in value) {
        if (value.hasOwnProperty(valueKey)) {
          object[key][index][valueKey] = value[valueKey];
        }
      }
    } else {
      object[key][index] = value;
    }
  }
}