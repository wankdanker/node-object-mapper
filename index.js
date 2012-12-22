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

var getKeyValue = exports.getKeyValue = 
function getKeyValue(obj, key, undefined) {
  var reg = /\./gi
    , subKey
    , keys
    , context
    , x
    ;
  
  if (key.indexOf('"') === 0) {
    return key.substr(1, key.lastIndexOf('"') - 1);
  }
  if (reg.test(key)) {
    keys = key.split(reg);
    context = obj;
    
    for (x = 0; x < keys.length; x++) {
      subKey = keys[x];
      
      //the values of all keys except for
      //the last one should be objects
      if (x < keys.length -1) {
        if (!context.hasOwnProperty(subKey)) {
          return undefined;
        }
        
        context = context[subKey];
      }
      else {
        return context[subKey];
      }
    }
  }
  else {
    return obj[key];
  }
};

var setKeyValue = exports.setKeyValue = 
function setKeyValue(obj, key, value) {
  var reg = /\./gi
    , subKey
    , keys
    , context
    , x
    ;
  
  //check to see if we need to process 
  //multiple levels of objects
  if (reg.test(key)) {
    keys = key.split(reg);
    context = obj;
    
    for (x = 0; x < keys.length; x++) {
      subKey = keys[x];
      
      //the values of all keys except for
      //the last one should be objects
      if (x < keys.length -1) {
        if (!context[subKey]) {
          context[subKey] = {};
        }
        
        context = context[subKey];
      }
      else {
        context[subKey] = value;
      }
    }
  }
  else {
    obj[key] = value;
  }
};

var merge = exports.merge = 
function merge(objFrom, objTo, propMap) {
  var toKey
    , fromKey
    , x
    , def
    , transform
    , key
    , startFrom
    , endFrom
    , startTo
    , endTo
    , toArray
    , fromArray
    ;
    
  if (!objTo) {
    objTo = {};
  }
  
  for(fromKey in propMap) {
    if (propMap.hasOwnProperty(fromKey)) {
      toKey = propMap[fromKey];

      //force toKey to an array of toKeys
      if (!Array.isArray(toKey)) {
        toKey = [toKey];
      }

      for(x = 0; x < toKey.length; x++) {
        def = null;
        transform = null;
        key = toKey[x]

        if (typeof(key) === "object") {
          def = key.default || null;
          transform = key.transform || null;
          key = key.key;
        }
        else if (Array.isArray(key)) {
          //key[toKeyName,transform,default]
          def = key[2] || null;
          transform = key[1] || null;
          key = key[0];
        }
        
        if (def && typeof(def) === "function" ) {
          def = def(objFrom, objTo);
        }

        if (fromKey.indexOf('[') !== -1 && fromKey.indexOf('"') !== 0) {
          startFrom = fromKey.substr(0, fromKey.indexOf('['));
          endFrom = fromKey.indexOf(']') + 2;
          endFrom = (endFrom < fromKey.length) ? fromKey.substr(endFrom) : null;
          fromArray = toArray = getKeyValue(objFrom, startFrom);
          if (Array.isArray(fromArray)) {
            if (key.indexOf('[') === -1) {
              throw "Target array mapping not exist!"
            }
            startTo = key.substr(0, key.indexOf('['));
            endTo = key.indexOf(']') + 2;
            endTo = (endTo < key.length) ? key.substr(endTo) : null;
            toArray = getKeyValue(objTo, startTo) || [];
            for (var i = 0; i < fromArray.length; i++) {
              toArray[i] = _mergeSingle(fromArray[i], toArray[i] || {}, endFrom, endTo, transform, def);
            }
            setKeyValue(objTo, startTo, toArray);
          }
        } else {
          _mergeSingle(objFrom, objTo, fromKey, key, transform, def);
        }
      }
    }
  }
  return objTo;
};

function _mergeSingle(objFrom, objTo, fromKey, toKey, transform, def) {
  var value = (fromKey) ? getKeyValue(objFrom, fromKey) : objFrom;
  if (transform) {
    value = transform(value, objFrom, objTo);
  }
  if (!toKey) {
    return value;
  }
  if (value || value === 0) {
    setKeyValue(objTo, toKey, value);
  }
  else if (def || def === 0) {
    setKeyValue(objTo, toKey, def);
  }
  return objTo;
}