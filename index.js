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

exports.getKeyValue = getKeyValue;

function getKeyValue(obj, key, undefined) {
  var subKey
    , keys
    , context
    , result
    , x
    , y
    , newKey
    ;
  
  if (/\./gi.test(key) || /\[[i]*\]/gi.test(key)) {
    keys = key.split(/\./gi);
    context = obj;
    
    for (x = 0; x < keys.length; x++) {
      subKey = keys[x];
      
      if (/\[[i]*\]/gi.test(subKey)) {
        //we expect that the source object has
        //an array at this key and we will want to
        //loop through it and build up an array to return
        
        //get the subKey without the array notation ([])
        
        subKey = subKey.split(/\[[i]*\]/gi)[0];
        
        if (!context.hasOwnProperty(subKey)) {
          return undefined;
        }
        else if (!Array.isArray(context[subKey])) {
          if (x < keys.length -1) {
            context = context[subKey];
          }
          else {
            return context[subKey];
          }
        }
        else {
          result = [];
          newKey = keys.slice(x + 1).join('.');
          
          for (y = 0; y < context[subKey].length; y++) {
            //if we have a valid newKey then that indicates that
            //the target should be an object
            //otherwise we should just get the value directly from
            //the array
            if (newKey) {
              result.push(getKeyValue(context[subKey][y], newKey));
            }
            else {
              result.push(context[subKey][y]);
            }
          }
          
          return result;
        }
      }
      else {
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
  }
  else {
    return obj[key];
  }
};

exports.setKeyValue = setKeyValue;

function setKeyValue(obj, key, value) {
  var subKey
    , keys
    , context
    , x
    , y
    , newKey
    ;
  
  //check to see if we need to process 
  //multiple levels of objects
  if (/\./gi.test(key) || /\[[i]*\]/gi.test(key)) {
    keys = key.split(/\./gi);
    context = obj;
    
    for (x = 0; x < keys.length; x++) {
      subKey = keys[x];
      
      if (/\[[i]*\]/gi.test(subKey)) {
        //we expect that the source object has
        //an array at this key and we will want to
        //loop through it and build up an array of objects
        
        //get the subKey without the array notation ([])
        subKey = subKey.split(/\[[i]*\]/gi)[0];
        
        if (!context[subKey]) {
          context[subKey] = [];
        }
        
        if (!Array.isArray(value)) {
          value = [value];
        }
        
        newKey = keys.slice(x + 1).join('.');
        
        for (y = 0; y < value.length; y++) {
          //if new key ended up having a value then it indicates
          //that we want a target object
          //otherwise we should just set the vlaue right in the 
          //array
          
          if (newKey) {
            context[subKey][y] = context[subKey][y] || {};
            setKeyValue(context[subKey][y], newKey, value[y])
          }
          else {
            context[subKey][y] = value[y];
          }
        }
        
        //NOTE: I haven't totally thought this break through.
        //but this works.
        break;
      }
      else {
        //the values of all keys except for
        //the last one should be objects
        if (x < keys.length -1) {
          if (!context[subKey]) {
            context[subKey] = {};
          }
          
          context = context[subKey];
        }
        else if (value !== undefined) {
          context[subKey] = value;
        }
      }
    }
  }
  else if (value !== undefined) {
    obj[key] = value;
  }
};

exports.merge = merge;

function merge(objFrom, objTo, propMap) {
  var toKey
    , fromKey
    , x
    , value
    , def
    , transform
    , key
    , frmArry
    , frmArryCount
    , toArry
    , toArryCount
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
      
      if (typeof(toKey[1]) == 'function') {
        toKey = [toKey];
      }

      for(x = 0; x < toKey.length; x++) {
        def = null;
        transform = null;
        key = toKey[x]

        if (Array.isArray(key)) {
          def = key[2] || null;
          transform = key[1] || null;
          key = key[0];
        }
        else if (typeof(key) === "object") {
          def = key.default || null;
          transform = key.transform || null;
          key = key.key;
        }
        
        if (def && typeof(def) === "function" ) {
          def = def(objFrom, objTo);
        }

        value = getKeyValue(objFrom, fromKey);
        
        //try to figure out if the source side has more
        //layers of arrays than the destination.
        frmArry = fromKey.match(/\[[i]*\]/g);
        toArry = key.match(/\[[i]*\]/g);
        frmArryCount = frmArry ? frmArry.length : 0;
        toArryCount = toArry ? toArry.length : 0;

        //if more "[]" are specified in the fromKey than
        //in the key, then we should unwrap the multi-dimensional
        //array
        if (frmArryCount > toArryCount) {
          //pass the transform along so that it is applied to
          //each of the elements that will ultimately be set
          value = unwrap(value, toArryCount, 0, transform);
        }
        else if (transform && /\[[i]*\]$/g.test(key)) {
          //target key is a bare array
          
          //we will not transform within the unwrap
          value = unwrap(value, toArryCount, 0, null);

          //loop through each element in the source array
          //and apply the transform
          value.forEach(function (val, ix) {
            value[ix] = transform(val, objFrom, objTo);
          });
        }
        else if (transform) {
          //execute the transform directly and get its value
          value = transform(value, objFrom, objTo);
        }
        
        if (value || value === 0 || value === false) {
          setKeyValue(objTo, key, value);
        }
        else if (def || def === 0 || def === false) {
          setKeyValue(objTo, key, def);
        }
      }
    }
  }
  
  return objTo;
};

/*
 * the unwrap function takes a multi-dimensional array and for targetDepth number
 * of dimensions, itterates through each dimension and then collapses any remaining
 * arrays into the array at dimension targetDepth
 * 
 * 
 */

function unwrap(array, targetDepth, currentDepth, transform) {
  var result = []
    , x
    ;

  currentDepth = currentDepth || 0;
  
  if (Array.isArray(array)) {
    if (currentDepth < targetDepth) {
      for (x = 0; x < array.length; x++) {
        result[x] = unwrap(array[x], targetDepth, currentDepth + 1, transform);
      }

      return result;
    }
    else {
      return unwrap(array[0], targetDepth, currentDepth + 1, transform);
    }
  }
  else {
    return transform ? transform(array) : array;
  }
}
