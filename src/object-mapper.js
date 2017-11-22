'use strict';
var getKeyValue = require('./get-key-value')
  , setKeyValue = require('./set-key-value')
  , _undefined
  ;


/**
 * Map a object to another using the passed map
 * @param fromObject
 * @param toObject
 * @param propertyMap
 * @returns {*}
 * @constructor
 */
function ObjectMapper(fromObject, toObject, propertyMap) {
  var propertyKeys;

  if (typeof propertyMap === 'undefined') {
    propertyMap = toObject;
    toObject = _undefined;
  }

  if (typeof toObject === 'undefined') {
    toObject = {};
  }

  propertyKeys = Object.keys(propertyMap);

  return _map(fromObject, toObject, propertyMap, propertyKeys);
}
module.exports = ObjectMapper;
module.exports.merge = ObjectMapper;
module.exports.getKeyValue = getKeyValue;
module.exports.setKeyValue = setKeyValue;

/**
 * Function that handle each key from map
 * @param fromObject
 * @param toObject
 * @param propertyMap
 * @param propertyKeys
 * @returns {*}
 * @private
 * @recursive
 */
function _map(fromObject, toObject, propertyMap, propertyKeys) {
  var fromKey
    , toKey
    ;

  if (propertyKeys.length) {
    fromKey = propertyKeys.splice(0, 1)[0];
    if (propertyMap.hasOwnProperty(fromKey)) {
      toKey = propertyMap[fromKey];

      toObject = _mapKey(fromObject, fromKey, toObject, toKey);
    } else {
      toObject = null;
    }
    return _map(fromObject, toObject, propertyMap, propertyKeys);
  } else {
    return toObject;
  }
}

/**
 * Function that calls get and set key values
 * @param fromObject
 * @param fromKey
 * @param toObject
 * @param toKey
 * @private
 * @recursive
 */
function _mapKey(fromObject, fromKey, toObject, toKey) {
  var fromValue
    , restToKeys
    , _default = null
    , transform
    ;

  if (Array.isArray(toKey) && toKey.length) {
    toKey = toKey.slice();
    restToKeys = toKey.splice(1);
    toKey = toKey[0];
  }

  if (_isObject(toKey)) {
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

  if (typeof fromValue === 'undefined' || typeof toKey === 'undefined') {
    return toObject;
  }

  toObject = setKeyValue(toObject, toKey, fromValue);

  if (Array.isArray(restToKeys) && restToKeys.length) {
    toObject = _mapKey(fromObject, fromKey, toObject, restToKeys);
  }

  return toObject;
}

function _isObject (item) {
  return (typeof item === "object" && !Array.isArray(item) && item !== null)
}
