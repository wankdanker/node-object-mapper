'use strict';
var utils = require('./utils')
  ;

/**
 * Make the set of a value withing the key in the passed object
 * @param baseObject
 * @param destinationKey
 * @param fromValue
 * @returns {*|{}}
 */
function SetKeyValue(baseObject, destinationKey, fromValue) {
  var merged = [];
  // matches only unescaped dots
  var regDot = /([^\\])(\\\\)*\./g;
  var keys = destinationKey.split(regDot);
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

  var key = keys.splice(0, 1);

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
    , regAppendArray = /(\[\]|\[(.*)\]\+)$/g
    , regCanBeNull = /(\?)$/g
    , match
    , appendToArray
    , canBeNull
    , arrayIndex = 0
    , valueIndex
    , isPropertyArray = false
    , isValueArray = false
    , value
    ;

  canBeNull = regCanBeNull.test(key);
  if(canBeNull){
    key = key.replace(regCanBeNull, '');
  }

  match = regArray.exec(key);
  appendToArray = regAppendArray.exec(key);
  if (match) {
    isPropertyArray = true;
    key = key.replace(regArray, '');
    isValueArray = (key !== '');
  }

  if (appendToArray) {
    match = appendToArray;
    isPropertyArray = true;
    isValueArray = (key !== '');
    key = key.replace(regAppendArray, '');
  }

  if (utils._isEmpty(destinationObject)) {
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
    if (isPropertyArray) {
      arrayIndex = match[2] || 0;
    }
  }
  if (keys.length === 0) {
    if(!canBeNull && (fromValue === null || fromValue === undefined)){
      return destinationObject;
    }
    if (isValueArray) {
      if (Array.isArray(destinationObject[key]) === false) {
        destinationObject[key] = [];
      }
      if(appendToArray){
          destinationObject[key].push(fromValue);
      } else{
        destinationObject[key][arrayIndex] = fromValue;
      }
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
      if (Array.isArray(fromValue) && utils._isNextArrayProperty(keys) === false) {
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
          destinationObject[arrayIndex + valueIndex] = _setValue(destinationObject[arrayIndex + valueIndex], keys[0], keys.slice(1), value);
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

