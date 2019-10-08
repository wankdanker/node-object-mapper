'use strict';

var _undefined
, performance = require('perf_hooks').performance

function ObjectMapper(from_object, to_object, property_map)
{
  global.elapsed['ObjectMapper'].n++ // performance monitoring
  let timer = performance.now()

  // There are a few different constructors - move around properties if needed
  if (typeof property_map === 'undefined') {
    property_map = to_object
    to_object = _undefined
  }

  // Loop through the map to process individual mapping instructions
  for (const [from_key_str, to_key_str] of Object.entries(property_map)) {

    global.elapsed['ObjectMapper'].ms += (performance.now() - timer)
    const from_data = getKeyValue(from_object, from_key_str)
    to_object = setKeyValue(to_object, to_key_str, from_data)
    timer = performance.now()
  }

  global.elapsed['ObjectMapper'].ms += (performance.now() - timer)
  return to_object
}

// if the data is an array, walk down the obj path and build until there is an array key
function update(obj, data, key_arr)
{
  global.elapsed['update'].n++ // performance monitoring
  let timer = performance.now()

  let x = 0 // index of the key array

  var o
  // Get the object key and index that needs to be parsed
  global.elapsed['update'].ms += (performance.now() - timer)
  var [key, ix] = key_arr.shift()
  timer = performance.now()

  // If there is a key, we need to traverse down to this part of the object
  if (key) {
    global.elapsed['update'].ms += (performance.now() - timer)
    o = update_obj(obj, key, data, key_arr)
    timer = performance.now()
  }

  if (ix !== null) {
    global.elapsed['update'].ms += (performance.now() - timer)
    o = update_arr(obj, key, ix, data, key_arr)
    timer = performance.now()
  }

  global.elapsed['update'].ms += (performance.now() - timer)
  return o
}

function update_obj(obj, key, data, key_arr)
{
  global.elapsed['update_obj'].n++ // performance monitoring
  let timer = performance.now()

  // If the object is undefined, we need to create a new object
  if (obj == null)
    obj = {}
  
    // Set the key of the object equal to the recursive, or if at the end, the data
  if (key_arr.length > 0) {
    global.elapsed['update_obj'].ms += (performance.now() - timer)
    obj[key] = update(obj[key], data, key_arr)
    timer = performance.now()
  } else {
    // This is a leaf.
    if (data) obj[key] = data
  }
  global.elapsed['update_obj'].ms += (performance.now() - timer)
  return obj
}

function update_arr(obj, key, ix, data, key_arr)
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
        o[i] = update(o[i], d, key_arr.slice())
        timer = performance.now()
        return o
      }
    }, obj)
    global.elapsed['update_arr'].ms += (performance.now() - timer)
    return obj
  }
  // If there is more work to be done, push an object onto the array
  else {
    var x = (ix) ? ix : 0
    if (key_arr.length > 0) {
      global.elapsed['update_arr'].ms += (performance.now() - timer)
      obj[x] = update(obj[x], data, key_arr)
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

  // Get the object key or index that needs to be parsed
  global.elapsed['select'].ms += (performance.now() - timer)
  var [key, ix] = key_arr.shift()
  timer = performance.now()

  // If there is an object key, grab the object property
  if (key) {
    global.elapsed['select'].ms += (performance.now() - timer)
    return select_obj(obj, key, key_arr)
  }

  // If we need to deal with an array, then loop through and return recursive select for each
  if (Array.isArray(obj)) {
    global.elapsed['select'].ms += (performance.now() - timer)
    return select_arr(obj, key, ix, key_arr)
  }
  global.elapsed['select'].ms += (performance.now() - timer)
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
    let _o = select(o, key_arr.slice())
    timer = performance.now()
    return _o
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
function parse(key_str, delimiter = '.')
{
  global.elapsed['parse'].n++ // performance monitoring
  let timer = performance.now()
  let _default = null
  let _transpose = null

  // If the value was passed in object notation, grab the default and transpose values, then rewrite as a string
  if (typeof(key) == 'object') {
    _default = key_str.default
    _transpose = key_str.transpose
    key_str = key_str.key
  }

  const key_arr = key_str.split(delimiter)
  let keys = []
  let n = 0
  for (let i=0, len1=key_arr.length; i<len1; i++) {
    // Build a object which is either an object key or an array
    //  Note that this is not the most readable, but it is fastest way to parse the string (at this point in time)
    let begin=-1, end=-1, key=key_arr[i]
    for (let j=0, len2=key.length; j<len2; j++) {
      if (key[j] == '[') begin = j
      if (key[j] == ']' && begin > -1) {
        end = j
        break
      }
    }
    // No array - just add object key
    if (begin == -1) {
      keys[n++] = [key_arr[i] || null, null]
    }
    // No key - just add array index
    else if (begin == 0 && end > 0) {
      keys[n++] = [null, key_arr[i].substring(begin+1,end)]
    }
    // Both object and array key
    else if (begin > 0 && end > 0) {
      keys[n++] = [key.substring(0,begin), null]
      keys[n++] = [null, key.substring(begin+1,end)]
    }
  }
  global.elapsed['parse'].ms += (performance.now() - timer)
  return keys
} 

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(obj, key_str)
{
  global.elapsed['getKeyValue'].n++ // performance monitoring
  let timer = performance.now()

  // Convert the mapping string into an array of instructions
  //  e.g. 'foo.bar[].baz => foo, bar, [], baz
  global.elapsed['getKeyValue'].ms += (performance.now() - timer)
  let key_arr = parse(key_str)
  timer = performance.now()

  // Return the selected object
  global.elapsed['getKeyValue'].ms += (performance.now() - timer)
  return select(obj, key_arr)
}

function setKeyValue(obj, key_str, data)
{
  global.elapsed['setKeyValue'].n++ // performance monitoring
  let timer = performance.now()

  // Key_str is an array of values
  if (Array.isArray(key_str)) {
    for (let i=0, len=key_str.length; i<len; i++) {
      global.elapsed['setKeyValue'].ms += (performance.now() - timer)
      let key_arr = parse(to_key_str[i])
      obj = update(obj, data, key_arr)
      timer = performance.now()
    }
  } else {
    global.elapsed['setKeyValue'].ms += (performance.now() - timer)
    let key_arr = parse(key_str)
    obj = update(obj, data, key_arr)
    timer = performance.now()
  }
  global.elapsed['setKeyValue'].ms += (performance.now() - timer)
  return obj
  // Nothing else is valid
}

module.exports = ObjectMapper
module.exports.getKeyValue = getKeyValue
module.exports.setKeyValue = setKeyValue
module.exports.parse = parse
// module.exports.merge = ObjectMapper;