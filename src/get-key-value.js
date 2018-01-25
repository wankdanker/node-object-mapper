'use strict';

var minimatch = require('minimatch');

/**
 * Make the get of a value with the key in the passed object
 * @param fromObject
 * @param fromKey
 * @constructor
 * @returns {*}
 */
function GetKeyValue(fromObject, fromKey) {
  var regFinishArray = /.+(\[\])/g
    , keys
    , key
    , result
    , lastValue
    , merged = []
    ;

  // matches only unescaped dots
  var regDot = /([^\\])(\\\\)*\./g;
  var keys = fromKey.split(regDot);
  for (var i = 0; i < keys.length; i++) {
    if ((i - 1) % 3 === 0) {
      // Every third match is the character of
      // the first group [^\\] which
      // is the last character of the key.
      // Merge it in again.
      var tmpKey = keys[i - 1] + keys[i];
      if (keys[i + 1]) {
        // If second group is found, this means
        // that the backslash itself is escaped.
        // Retain unchanged as well.
        tmpKey += keys[i + 1];
      }
      merged.push(tmpKey.replace(/\\\./g, "."));
    }
    // Add part after last dot
    if (i === keys.length - 1) {
      merged.push(keys[i].replace(/\\\./g, "."));
    }
  }
  keys = merged;
  key = keys.splice(0, 1);
  lastValue = fromKey.match(regFinishArray);
  if(lastValue != null && lastValue[0] === fromKey){
    fromKey = fromKey.slice(0,-2);
  }else{
    lastValue = null;
  }
  result = _getValue(fromObject, key[0], keys);

  if (Array.isArray(result) && !lastValue) {
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
      if (typeof arrayIndex === 'undefined' || fromObject[key] === undefined) {
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
      if (fromObject[key] === undefined) {
        result = _getGlobValues(fromObject, key, keys);
      } else {
        result = fromObject[key];
      }
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
      if (fromObject[key] === undefined) {
        result = _getGlobValues(fromObject, key, keys);
      } else {
        result = _getValue(fromObject[key], keys[0], keys.slice(1));
      }
    }
  }

  return result;
}

/**
 * Keeps recursing _getValue method with glob matching.
 * @param fromObject
 * @param key
 * @param keys
 * @returns {*}
 * @private
 */
function _getGlobValues(fromObject, key, keys) {
  var currentKeys = Object.keys(fromObject);
  var results = [];

  for (var i = 0; i < currentKeys.length; i++) {
    var currentKey = currentKeys[i];
    if (minimatch(currentKey, key)) {
      var value = keys.length ? _getValue(fromObject[currentKey], keys[0], keys.slice(1)) : fromObject[currentKey];
      if (value !== undefined) {
        results.push(value);
      }
    }
  }

  return results.length ? results : undefined;
}
