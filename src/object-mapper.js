'use strict';

var _undefined

function ObjectMapper(from_obj, to_obj, property_map)
{
  // There are a few different constructors - move around properties if needed
  if (typeof property_map === 'undefined') {
    property_map = to_obj
    to_obj = _undefined
  }

  // Loop through the map to process individual mapping instructions
  for (const [from_key_str, to_key_str] of Object.entries(property_map)) {
    const from_data = getKeyValue(from_obj, from_key_str)
    let context = {from_obj: from_obj, from_key: from_key_str, to_key: to_key_str}
    to_obj = setKeyValue(to_obj, to_key_str, from_data, context)
  }

  return to_obj
}

function select(obj, key_arr)
{
  // Get the object key or index that needs to be parsed
  const key = key_arr.shift()

  // If there is an object key, grab the object property
  if (key.name) {
    return select_obj(obj, key, key_arr)
  }

  // If we need to deal with an array, then loop through and return recursive select for each
  if (Array.isArray(obj)) {
    return select_arr(obj, key, key_arr)
  }
}

function select_obj(obj, key, key_arr)
{
  // If the instruction is to get an object and there is an array, just select the first item in the array.
  // This should be in the map definition, but this is a solution for wonky APIs
  if (Array.isArray(obj)) obj = obj[0]

  if (key.name && key.name in obj) {
    if (key_arr.length > 0)
      return select(obj[key.name], key_arr)
    return obj[key.name]
  }
}

function select_arr(arr, key, key_arr)
{
  // Recursively loop through the array and grab the data
  arr = arr.map( function(o) {
    return (key_arr.length > 0) ? select(o, key_arr.slice()) : o
  })
  // If we are expecting an array, just return what we did
  if (key.ix == '') return arr
  // If we are looking for a specific array element, just return that
  if (key.ix) return arr[key.ix]
  // Otherwise, return the results in the first array element
  return arr[0]
}

// if the data is an array, walk down the obj path and build until there is an array key
function update(obj, data, key_arr, context)
{
  if (key_arr) {
    // Get the object key and index that needs to be parsed
    const key = key_arr.shift()

    // If there is a key, we need to traverse down to this part of the object
    if (key.name)
      return update_obj(obj, key, data, key_arr, context)

    // If there is an array index, we need to traverse through the array
    if (typeof key.ix !== 'undefined')
      return update_arr(obj, key, data, key_arr, context)
  }

  // If there is neither an array or index, we need to see if there is data to set
  return set_data(obj, key_arr, data, context)

}

function update_obj(obj, key, data, key_arr, context)
{
  // If the object is undefined, we need to create a new object
  obj = obj || {}
  
  // Set the key of the object equal to the recursive, or if at the end, the data
  if (key_arr.length > 0)
    obj[key.name] = update(obj[key.name], data, key_arr, context)
  // This is a leaf.  Set to the value, or if it is missing, the default value
  else
    obj = set_data(obj, key, data, context)

  return obj
}

function update_arr(arr, key, data, key_arr, context)
{
  // If the top level object is undefined, we need to create a new array
  if (arr == null) arr = []

  // Make sure that there is an array item for each item in the data array
  if (Array.isArray(data)) {
    arr = data.reduce(function(o,d,i) {
      if (i == '' || i == i) {
        o[i] = update(o[i], d, key_arr.slice(), context)
        return o
      }
    }, arr)

    return arr
  }
  // If there is more work to be done, push an object onto the array
  else {
    const x = (key.ix) ? key.ix : 0
    if (key_arr.length > 0)
      arr[x] = update(arr[x], data, key_arr, context)
    else
      arr[x] = data
  }

  return arr
}
  
function set_data(obj, key, data, context)
{
  // Initialize the object if it does not exist
  if (obj == null || typeof obj == 'undefined')
    obj = {}

  // See if there is a transform function and run it
  if (typeof context.transform == 'function')
    data = context.transform(data, context.from_obj, obj, context.from_key, context.to_key)

  // See if data is null and there is a default
  if (context.default && (data == null || typeof data == 'undefined')) {
    if (typeof context.default == 'function')
      data = context.default(context.from_obj, context.from_key, context.to_obj, context.to_key)
    else
      data = context.default
  }

  // Set the object to the data if it is not undefined
  if (typeof data !== 'undefined')
    if (data !== null || key.nulls)
      obj[key.name] = data

  return obj
}

// Turns a key string (like key1.key2[].key3 into ['key1','key2','[]','key3']...)
// 
function parse(key_str, delimiter = '.')
{
  // Return null if the key_str is null
  if (key_str == null)
    return null

  const key_arr = key_str.split(delimiter)
  let keys = []
  let n = 0
  for (let i=0, len1=key_arr.length; i<len1; i++) {
    // Build a object which is either an object key or an array
    //  Note that this is not the most readable, but it is fastest way to parse the string (at this point in time)
    let begin=-1, end=-1, add=null, nulls=null, key=key_arr[i]
    for (let j=0, len2=key.length; j<len2; j++) {
      if (key[j] == '[') begin = j
      if (key[j] == ']' && begin > -1) end = j
      if (key[j] == '+' && end == (j-1) ) add = true
      if (key[j] == '?' && end == -1) nulls = true
    }
    // No array - just add object key
    if (begin == -1) {
      let k = {}
      if (key_arr[i]) k.name = key_arr[i]
      if (nulls) k.nulls = nulls
      keys[n++] = k
    }
    // No key - just add array index
    else if (begin == 0 && end > 0) {
      let k = {ix: key_arr[i].substring(begin+1,end) }
      if (add) k.add = add
      keys[n++] = k
    }
    // Both object and array key
    else if (begin > 0 && end > 0) {
      let k = {name: key.substring(0,begin)}
      if (nulls) k.nulls = nulls
      keys[n++] = k
      k = {ix: key.substring(begin+1,end)}
      if (add) k.add = add
      keys[n++] = k
    }
  }

  return keys
} 

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(obj, key_str)
{
  return select(obj, parse(key_str) )
}

function setKeyValue(obj, key_str, data, context = {})
{
  // Deal with object notation here.  If in object notation, split out each variable.  Otherwise, just pass back key
  const _vals = function(k) {
    return (typeof(k) == 'object') ? [k.key, k.transform, k.default] : [k]
  }

  // Key_str is undefined - ignore
  if (typeof key_str == 'undefined')
    return obj

  // Key_str is an array of values
  let k,t,d
  if (Array.isArray(key_str)) {
    for (let i=0, len=key_str.length; i<len; i++) {
      // Check to see if the value is in array notation
      if (Array.isArray(key_str[i]))
        [k,t,d] = key_str[i]
      else
        [k,t,d] = _vals(key_str[i])
      context.transform = t
      context.default = d
      obj = update(obj, data, parse(k), context)
    }
  } else {
    [k,t,d] = _vals(key_str)
    context.transform = t
    context.default = d
    obj = update(obj, data, parse(k), context)
  }

  return obj
}

module.exports = ObjectMapper
module.exports.getKeyValue = getKeyValue
module.exports.setKeyValue = setKeyValue
module.exports.parse = parse
// module.exports.merge = ObjectMapper;