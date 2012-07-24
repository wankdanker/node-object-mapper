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
    , value
    , def
    , key
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
        key = toKey[x]

        if (typeof(key) === "object") {
          def = key.default || null;
          key = key.key;
          
          if (typeof(def) === "function" ) {
            def = def(objFrom, objTo);
          }
        }

        value = getKeyValue(objFrom, fromKey);
        
        setKeyValue(objTo, toKey[x], value || null);
      }
    }
  }
  
  return objTo;
};