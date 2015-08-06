'use strict';

/**
 * Make the get of a value with the key in the passed object
 * @param fromObject
 * @param fromKey
 * @constructor
 * @returns {*}
 */
function GetKeyValue(fromObject, fromKey) {
  var regDot = /\./g
    , keys
    , key
    , result
    ;

  keys = fromKey.split(regDot);
  key = keys.splice(0, 1);

  result = _getValue(fromObject, key[0], keys);

  if (Array.isArray(result)) {
    if (result.length) {
      result = result.reduce(function (a, b) {
        if (Array.isArray(a) && Array.isArray(b)) {
          return a.concat(b);
        } else if (Array.isArray(a)) {
          a.push(b);
          return a;
        } else {
          return [a, b];
        }
      });
    }
    if (!Array.isArray(result)) {
      result = [result];
    }
  }

  return result;
}
module.exports = GetKeyValue;

/**
 * Get the value of key within passed object, considering if there is a array or object
 * @param fromObject
 * @param key
 * @param keys
 * @returns {*}
 * @private
 * @recursive
 */
function _getValue(fromObject, key, keys) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , match
    , arrayIndex
    , isValueArray = false
    , result
    ;

  if (!fromObject) {
    return;
  }

  match = regArray.exec(key);
  if (match) {
    key = key.replace(regArray, '');
    isValueArray = (key !== '');
    arrayIndex = match[2];
  }

  if (keys.length === 0) {
    if (isValueArray) {
      if (typeof arrayIndex === 'undefined') {
        result = fromObject[key];
      } else {
        result = fromObject[key][arrayIndex];
      }
    } else if (Array.isArray(fromObject)) {
      if (key === '') {
        if (typeof arrayIndex === 'undefined') {
          result = fromObject;
        } else {
          result = fromObject[arrayIndex];
        }
      } else {
        result = fromObject.map(function (item) {
          return item[key];
        })
      }
    } else {
      result = fromObject[key];
    }
  } else {
    if (isValueArray) {
      if (Array.isArray(fromObject[key])) {
        if (typeof arrayIndex === 'undefined') {
          result = fromObject[key].map(function (item) {
            return _getValue(item, keys[0], keys.slice(1));
          });
        } else {
          result = _getValue(fromObject[key][arrayIndex], keys[0], keys.slice(1));
        }
      } else {
        if (typeof arrayIndex === 'undefined') {
          result = _getValue(fromObject[key], keys[0], keys.slice(1));
        } else {
          result = _getValue(fromObject[key][arrayIndex], keys[0], keys.slice(1));
        }
      }
    } else if (Array.isArray(fromObject)) {
      if (key === '') {
        if (typeof arrayIndex === 'undefined') {
          result = _getValue(fromObject, keys[0], keys.slice(1));
        } else {
          result = _getValue(fromObject[arrayIndex], keys[0], keys.slice(1));
        }
      } else {
        result = fromObject.map(function (item) {
          result = _getValue(item, keys[0], keys.slice(1));
        })
      }
      if (typeof arrayIndex === 'undefined') {
        result = fromObject.map(function (item) {
          return _getValue(item, keys[0], keys.slice(1));
        });
      } else {

        result = _getValue(fromObject[arrayIndex], keys[0], keys.slice(1));
      }
    } else {
      result = _getValue(fromObject[key], keys[0], keys.slice(1));
    }
  }

  return result;
}