'use strict';

var _undefined
, performance = require('perf_hooks').performance

function ObjectMapper(from_object, to_object, property_map)
{
  global.elapsed['ObjectMapper'].n++ // performance monitoring

  // There are a few different constructors - move around properties if needed
  if (typeof property_map === 'undefined') {
    property_map = to_object;
    to_object = _undefined
  }

  for (const [from_key, to_key] of Object.entries(property_map)) {

    // Traverse the 'from' object
    var from_data = getKeyValue(from_object, from_key)
 
    // Insert into the 'to' object
    to_object = setKeyValue(to_object, to_key, from_data)
  }

  return to_object
}

// if the data is an array, walk down the obj path and build until there is an array key
function update(obj, key_arr, data)
{
  global.elapsed['update'].n++ // performance monitoring
  let timer = performance.now()
  let x = 0 // index of the key array

  var o
  // Get the object key and index that needs to be parsed
  var [key, ix] = process(key_arr.shift())

  // If there is a key, we need to traverse down to this part of the object
  if (key) {
    global.elapsed['update'].ms += (performance.now() - timer)
    o = update_obj(obj, key, key_arr, data)
    timer = performance.now()
  }

  if (ix !== null) {
    global.elapsed['update'].ms += (performance.now() - timer)
    o = update_arr(obj, key, ix, key_arr, data)
    timer = performance.now()
  }

  global.elapsed['update'].ms += (performance.now() - timer)
  return o
}

function update_obj(obj, key, key_arr, data)
{
  global.elapsed['update_obj'].n++ // performance monitoring
  let timer = performance.now()

  // If the object is undefined, we need to create a new object
  if (obj == null) obj = {}
  // Set the key of the object equal to the recursive, or if at the end, the data
  if (key_arr.length > 0) {
    global.elapsed['update_obj'].ms += (performance.now() - timer)
    obj[key] = update(obj[key], key_arr, data)
    timer = performance.now()
  } else {
    // This is a leaf.
    if (data) obj[key] = data
  }
  global.elapsed['update_obj'].ms += (performance.now() - timer)
  return obj
}

function update_arr(obj, key, ix, key_arr, data)
{
  global.elapsed['update_arr'].n++ // performance monitoring
  let timer = performance.now()

  // If the top level object is undefined, we need to create a new array
  if (obj == null) obj = []
  // Make sure that there is an array item for each item in the data array
  if (Array.isArray(data)) {
    obj = data.reduce(function(o,d,i) {
      if (i == '' || i == i) {
        global.elapsed['update_arr'].ms += (performance.now() - timer)
        o[i] = update(o[i], key_arr.slice(), d)
        timer = performance.now()
        return o
      }
    }, obj)
    return obj
  }
  // If there is more work to be done, push an object onto the array
  else {
    var x = (ix) ? ix : 0
    if (key_arr.length > 0) {
      global.elapsed['update_arr'].ms += (performance.now() - timer)
      obj[x] = update(obj[x], key_arr, data)
      timer = performance.now()
    } else {
      global.elapsed['update_arr'].ms += (performance.now() - timer)
      obj[x] = data
      timer = performance.now()
    }
  }

  global.elapsed['update_arr'].ms += (performance.now() - timer)
  return obj
}
  
function select(obj, key_arr)
{
  global.elapsed['select'].n++ // performance monitoring
  let timer = performance.now()

  // Check to see if key_arr is not an array.  If so, wrap it in an array.
  // This is done for backwards compatibility from external functions that pass in a string
  if (!Array.isArray(key_arr))
    key_arr = parse(key_arr)

  // If we are at the end of the key array x`stack, return the object
  if (key_arr.length == 0) {
    global.elapsed['update_arr'].ms += (performance.now() - timer)
    return obj
  }

  // Get the object key or index that needs to be parsed
  global.elapsed['update_arr'].ms += (performance.now() - timer)
  var [key, ix] = process(key_arr.shift())
  timer = performance.now()

  // If there is an object key, grab the object property
  if (key) {
    global.elapsed['update_arr'].ms += (performance.now() - timer)
    return select_obj(obj, key, key_arr)
  }

  // If we need to deal with an array, then loop through and return recursive select for each
  if (Array.isArray(obj)) {
    global.elapsed['update_arr'].ms += (performance.now() - timer)
    return select_arr(obj, key, ix, key_arr)
  }
}

function select_obj(obj, key, key_arr)
{
  global.elapsed['select_obj'].n++ // performance monitoring
  let timer = performance.now()

  let o = null
  if (key in obj) {
    if (key_arr.length > 0) {
      global.elapsed['select_obj'].ms += (performance.now() - timer)
      o = select(obj[key], key_arr)
      timer = performance.now()
    } else
      o = obj[key]
  }

  // Nothing left to process - return the object
  global.elapsed['select_obj'].ms += (performance.now() - timer)
  return o
}

function select_arr(obj, key, ix, key_arr)
{
  global.elapsed['select_arr'].n++ // performance monitoring
  let timer = performance.now()

  // Recursively loop through the array and grab the data
  obj = obj.map( function(o) {
    global.elapsed['select_arr'].ms += (performance.now() - timer)
    return select(o, key_arr.slice())
    timer = performance.now()
  })
  // obj = obj.map( function(o) {
  //   global.elapsed['select_arr'].ms += (performance.now() - timer)
  //   return select(o, key_arr.slice())
  //   timer = performance.now()
  // })
  global.elapsed['select_arr'].ms += (performance.now() - timer)
  // If we are expecting an array, just return what we did
  if (ix == '') return obj
  // If we are looking for a specific array element, just return that
  if (ix) return obj[ix]
  // Otherwise, return the results in the first array element
  return obj[0]
}

// Turns a key string (like key1.key2[].key3 into ['key1','key2','[]','key3']...)
// 
function parse(key, delimiter = '.')
{
  global.elapsed['parse'].n++ // performance monitoring
  let timer = performance.now()

  if (typeof(key) == 'string') {
    var key_array = key.split(delimiter)  
    var keys = key_array.reduce(function(keys,current_key) {
      var [k,ix] = process(current_key)
      if (k) keys.push(k)
      if (ix !== null) keys.push('[' + ix + ']')
      return keys
    }, [])
    global.elapsed['parse'].ms += (performance.now() - timer)
    return keys
  }
  global.elapsed['parse'].ms += (performance.now() - timer)
} 

function process(k)
{
  global.elapsed['process'].n++ // performance monitoring
  let timer = performance.now()

  var arr
  try {
    var [_,key,ix] = k.match(/(.*?)\[(.*?)\]/)
    arr = [key,ix]
  } catch (e) {
    arr = [k,null]
  }
  global.elapsed['parse'].ms += (performance.now() - timer)
  return arr
}

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(obj, key_str)
{
  global.elapsed['getKeyValue'].n++ // performance monitoring

  // String
  if (typeof(key_str) == 'string') return select(obj,parse(key_str))
  // Nothing else is valid
}

function setKeyValue(obj,key_str,data)
{
  global.elapsed['setKeyValue'].n++ // performance monitoring

  // String
  if (Array.isArray(key_str)) {
    key_str.forEach(function(k) {
      obj = update(obj, parse(k), data)
    })
    return obj
  }
  // Key_str is written in object notation form
  if (typeof(key_str) == 'object')
    return update(obj, parse(key_str.key), data, key_str.default, key_str.transpose)
  // Key_str is written as a simple string
  if (typeof(key_str) == 'string')
    return update(obj, parse(key_str), data)
  // Nothing else is valid
}

module.exports = ObjectMapper
module.exports.getKeyValue = getKeyValue
module.exports.setKeyValue = setKeyValue
module.exports.process = process
module.exports.parse = parse
// module.exports.merge = ObjectMapper;