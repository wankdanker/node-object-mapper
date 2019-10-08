'use strict';

var _undefined

function ObjectMapper(from_object, to_object, property_map)
{
  // There are a few different constructors - move around properties if needed
  if (typeof property_map === 'undefined') {
    property_map = to_object
    to_object = _undefined
  }

  // Loop through the map to process individual mapping instructions
  for (const [from_key_str, to_key_str] of Object.entries(property_map)) {
    const from_data = getKeyValue(from_object, from_key_str)
    to_object = setKeyValue(to_object, to_key_str, from_data)
  }

  return to_object
}

// if the data is an array, walk down the obj path and build until there is an array key
function update(obj, data, key_arr)
{
  // Get the object key and index that needs to be parsed
  const [key, ix] = key_arr.shift()

  // If there is a key, we need to traverse down to this part of the object
  if (key)
    return update_obj(obj, key, data, key_arr)

  // If there is an array index, we need to traverse through the array
  if (ix !== null)
    return update_arr(obj, ix, data, key_arr)
}

function update_obj(obj, key, data, key_arr)
{
  // If the object is undefined, we need to create a new object
  obj = obj || {}
  
    // Set the key of the object equal to the recursive, or if at the end, the data
  if (key_arr.length > 0) {
    obj[key] = update(obj[key], data, key_arr)
  } else {
    // This is a leaf.
    if (data) obj[key] = data
  }

  return obj
}

function update_arr(arr, ix, data, key_arr)
{
  // If the top level object is undefined, we need to create a new array
  if (arr == null) arr = []

  // Make sure that there is an array item for each item in the data array
  if (Array.isArray(data)) {
    arr = data.reduce(function(o,d,i) {
      if (i == '' || i == i) {
        o[i] = update(o[i], d, key_arr.slice())
        return o
      }
    }, arr)

    return arr
  }
  // If there is more work to be done, push an object onto the array
  else {
    const x = (ix) ? ix : 0
    if (key_arr.length > 0)
      arr[x] = update(arr[x], data, key_arr)
    else
      arr[x] = data
  }

  return arr
}
  
function select(obj, key_arr)
{
  // Get the object key or index that needs to be parsed
  const [key, ix] = key_arr.shift()

  // If there is an object key, grab the object property
  if (key) {
    return select_obj(obj, key, key_arr)
  }

  // If we need to deal with an array, then loop through and return recursive select for each
  if (Array.isArray(obj)) {
    return select_arr(obj, ix, key_arr)
  }
}

function select_obj(obj, key, key_arr)
{
  // If the instruction is to get an object and there is an array, just select the first item in the array.
  // This should be in the map definition, but this is a solution for wonky APIs
  if (Array.isArray(obj)) obj = obj[0]

  if (key in obj) {
    if (key_arr.length > 0)
      return select(obj[key], key_arr)
    return obj[key]
  }
}

function select_arr(arr, ix, key_arr)
{
  // Recursively loop through the array and grab the data
  arr = arr.map( function(o) {
    return (key_arr.length > 0) ? select(o, key_arr.slice()) : o
  })
  // If we are expecting an array, just return what we did
  if (ix == '') return arr
  // If we are looking for a specific array element, just return that
  if (ix) return arr[ix]
  // Otherwise, return the results in the first array element
  return arr[0]
}

// Turns a key string (like key1.key2[].key3 into ['key1','key2','[]','key3']...)
// 
function parse(key_str, delimiter = '.')
{
  let _default = null
  let _transpose = null

  // If the value was passed in object notation, grab the default and transpose values, then rewrite as a string
  if (typeof(key_str) == 'object') {
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

  return [keys, _default, _transpose]
} 

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(obj, key_str)
{
  return select(obj, parse(key_str) )
}

function setKeyValue(obj, key_str, data)
{
  // Key_str is an array of values
  if (Array.isArray(key_str))
    for (let i=0, len=key_str.length; i<len; i++)
      obj = update(obj, data, parse(key_str[i]) )
  else
    obj = update(obj, data, parse(key_str) )

  return obj
}

module.exports = ObjectMapper
module.exports.getKeyValue = getKeyValue
module.exports.setKeyValue = setKeyValue
module.exports.parse = parse
// module.exports.merge = ObjectMapper;