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

module.exports = objectMapper;
module.exports.merge = objectMapper;
module.exports.getKeyValue = getKeyValue;
module.exports.setKeyValue = setKeyValue;

function getKeyValue(obj, key, undefined) {
  var reg = /\./gi
    , regArray = /(\[\]|\[(.*)\])$/g
    , subKey
    , keys
    , context
    , x
    , arrayWork
    , arrayIndex
    ;

  if (reg.test(key)) {
    keys = key.split(reg);
    context = obj;

    for (x = 0; x < keys.length; x++) {
      subKey = keys[x];
      arrayWork = false;

      if (regArray.test(subKey)) {
        regArray.lastIndex = 0;
        arrayWork = true;
        arrayIndex = regArray.exec(subKey)[2];

        if (isNaN(arrayIndex)) {
          arrayIndex = null;
        }
        subKey = subKey.replace(regArray,'');
      }

      //the values of all keys except for
      //the last one should be objects
      if (x < keys.length -1) {
        if (context === undefined || !context.hasOwnProperty(subKey)) {
          return undefined;
        }

        if (arrayWork && arrayIndex === null) {
          //set context to the entire array
          context = context[subKey];

          if (Array.isArray(context)) {
            key = keys.slice(x + 1).join('.');
            return context.map(function (obj) {
              return getKeyValue(obj, key);
            });
          }
        }
        else if (arrayWork) {
          context = context[subKey][arrayIndex];
        }
        else {
          context = context[subKey];
        }
      }
      else {
        if (arrayWork && arrayIndex === null) {
          return context ? context[subKey] : undefined;
        }
        else if (arrayWork) {
          return context ? context[subKey][arrayIndex] : undefined;
        }
        else {
          return context ? context[subKey] : undefined;
        }
      }
    }
  }
  else {
    if (regArray.test(key)) {
      regArray.lastIndex = 0;
      arrayIndex = regArray.exec(key)[2];
      if (Number.isNaN(arrayIndex)) {
        arrayIndex = null;
      }
      key = key.replace(regArray,'');
      if (arrayIndex === null) {
        //return the whole array
        return obj[key];
      }
      else {
        return obj[key][arrayIndex];
      }
    }
    else {
      return obj[key];
    }
  }
};

function setKeyValue(obj, key, value) {
  var reg = /\./gi
    , regArray = /(\[\]|\[(.*)\])/g
    , subKey
    , keys
    , context
    , x
    , arrayWork
    , arrayIndex
    ;

  //check to see if we need to process
  //multiple levels of objects
  if (reg.test(key)) {
    keys = key.split(reg);
    context = obj;

    for (x = 0; x < keys.length; x++) {
      subKey = keys[x];
      arrayWork = false;

      if(regArray.test(subKey)){
        regArray.lastIndex = 0;
        arrayWork = true;
        arrayIndex = regArray.exec(subKey)[2];

        if (isNaN(arrayIndex)) {
          arrayIndex = null;
        }       
        
        subKey = subKey.replace(regArray,'');
      }

      //the values of all keys except for
      //the last one should be objects
      if (x < keys.length -1) {
        if (arrayWork && arrayIndex === null) {
          context[subKey] = context[subKey] || [];

          if (Array.isArray(value)) {
            key = keys.slice(x+1).join('.');
            
            value.forEach(function (obj, i) {

            var tmp = context[subKey][i] = context[subKey][i] || {};
              setKeyValue(tmp, key, obj);
            });

            return;
          }
          else {
            context[subKey][arrayIndex || 0] = context[subKey][0] || {}
          }
        }
        else if (!context[subKey]) {
          if (arrayWork) {
            context[subKey] = [];
            context[subKey][arrayIndex] = context[subKey][arrayIndex] || {};
          }
          else {
            context[subKey] = {};
          }
        }
        
        context = context[subKey];
      }
      else {
        if (Array.isArray(context)) {
          context[arrayIndex || 0][subKey] = value;
        }
        else {
          context[subKey] = value;
        }
      }
    }
  }
  else {
    if (regArray.test(key)) {
      regArray.lastIndex = 0;
      key = key.replace(regArray, '');
      obj[key] = [value];
    }
    else {
      obj[key] = value;
    }
  }
};

function objectMapper (objFrom, objTo, propMap) {
  var toKey
    , fromKey
    , x
    , value
    , def
    , transform
    , key
    , keyIsArray
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
        key = toKey[x];
        keyIsArray = Array.isArray(key);

        if (typeof(key) === "object" && !keyIsArray) {
          def = key.default || null;
          transform = key.transform || null;
          key = key.key;
          //evaluate if the new key is an array
          keyIsArray = Array.isArray(key);
        }

        if (keyIsArray) {
          //key[toKeyName,transform,default]
          def = key[2] || null;
          transform = key[1] || null;
          key = key[0];
        }

        if (def && typeof(def) === "function" ) {
          def = def(objFrom, objTo);
        }

        value = getKeyValue(objFrom, fromKey);

        if (transform) {
          value = transform(value, objFrom, objTo);
        }

        if (typeof value !== 'undefined') {
          setKeyValue(objTo, key, value);
        }
        else if (typeof def !== 'undefined') {
          setKeyValue(objTo, key, def);
        }
      }
    }
  }

  return objTo;
};
