"use strict";
/*

 The MIT License (MIT)
 =====================

 Copyright (c) 2012 Daniel L. VerWeire

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
var _ = require('lodash');

var undefined;

module.exports = objectMapper;
module.exports.merge = objectMapper;
module.exports.getKeyValue = getKeyValue;
module.exports.setKeyValue = setKeyValue;

function _getValue(obj, key) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , arrayIndex;

  if (regArray.test(key)) {
    regArray.lastIndex = 0;
    arrayIndex = regArray.exec(key)[2];
    key = key.replace(regArray, '');

    if (Number.isNaN(arrayIndex)) {
      arrayIndex = undefined;
    }
    if (typeof arrayIndex === 'undefined') {
      return obj[key];
    } else {
      return obj[key][arrayIndex];
    }
  } else if (obj && obj.hasOwnProperty(key)) {
    return obj[key];
  } else {
    return null;
  }
}

function getKeyValue(obj, key) {
  var regDot = /\./g
    , next
    , keyRest
    ;

  if (regDot.test(key)) {
    next = key.indexOf('.');
    keyRest = key.substring(next + 1);
    key = key.substring(0, next);

    return getKeyValue(_getValue(obj, key), keyRest);
  } else {
    return _getValue(obj, key);
  }
}

function _setValue(obj, key, value) {
  var regArray = /(\[\]|\[(.*)\])$/g
    , arrayIndex
    , valueKey;

  if (regArray.test(key)) {
    regArray.lastIndex = 0;
    arrayIndex = regArray.exec(key)[2];
    key = key.replace(regArray, '');

    if (typeof obj[key] === 'undefined') {
      obj[key] = [];
    }

    if (Number.isNaN(arrayIndex)) {
      arrayIndex = undefined;
    }
    if (typeof arrayIndex === 'undefined') {
      arrayIndex = 0;
    }
    if (typeof obj[key][arrayIndex] === 'undefined') {
      obj[key][arrayIndex] = {};
    }
    if (typeof value === 'object') {
      valueKey = Object.keys(value)[0];
      if (value.hasOwnProperty(valueKey)) {
        obj[key][arrayIndex][valueKey] = value[valueKey];
      }
    } else {
      obj[key][arrayIndex] = value;
    }
  } else {
    obj[key] = value;
  }
  return obj[key];
}

function setKeyValue(obj, key, value) {
  var regDot = /\./g
    , next
    , keyRest
    ;

  obj = obj || {};

  if (regDot.test(key)) {
    next = key.indexOf('.');
    keyRest = key.substring(next + 1);
    key = key.substring(0, next);

    _setValue(obj, key, setKeyValue(obj[key], keyRest, value));
  } else {
    _setValue(obj, key, value);
  }

  return obj;
}

function _mapKey(fromObject, fromKey, toObject, toKey) {
  var fromValue
    , restToKeys
    , _default = null
    , transform
    ;

  if (Array.isArray(toKey) && toKey.length) {
    restToKeys = toKey.splice(1);
    toKey = toKey[0];
  }


  if (toKey instanceof Object && Object.getPrototypeOf(toKey) === Object.prototype) {
    _default = toKey.default || null;
    transform = toKey.transform;
    toKey = toKey.key;
  }

  if (Array.isArray(toKey)) {
    transform = toKey[1];
    _default = toKey[2] || null;
    toKey = toKey[0];
  }

  if (typeof _default === 'function') {
    _default = _default(fromObject, fromKey, toObject, toKey);
  }

  fromValue = getKeyValue(fromObject, fromKey);
  if (typeof fromValue === 'undefined' || fromValue === null) {
    fromValue = _default;
  }

  if (typeof fromValue !== 'undefined' && typeof transform === 'function') {
    fromValue = transform(fromValue, fromObject, toObject, fromKey, toKey);
  }

  setKeyValue(toObject, toKey, fromValue);

  if (Array.isArray(restToKeys) && restToKeys.length) {
    _mapKey(fromObject, fromKey, toObject, restToKeys);
  }
}
function _map(fromObject, toObject, propertyMap, propertyKeys) {
  var fromKey
    , toKey
    ;

  if (propertyKeys.length) {
    fromKey = propertyKeys.splice(0, 1)[0];
    if (propertyMap.hasOwnProperty(fromKey)) {
      toKey = propertyMap[fromKey];

      _mapKey(fromObject, fromKey, toObject, toKey);
    }
    return _map(fromObject, toObject, propertyMap, propertyKeys);
  } else {
    return toObject;
  }
}

function objectMapper(fromObject, toObject, propertyMap) {
  //avoid ref change
  fromObject = _.cloneDeep(fromObject);
  toObject = _.cloneDeep(toObject);
  propertyMap = _.cloneDeep(propertyMap);

  var propertyKeys;

  if (typeof propertyMap === 'undefined') {
    propertyMap = toObject;
    toObject = undefined;
  }

  if (typeof toObject === 'undefined') {
    toObject = {};
  }

  propertyKeys = Object.keys(propertyMap);

  return _map(fromObject, toObject, propertyMap, propertyKeys);
}