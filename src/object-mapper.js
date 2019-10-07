'use strict';

var _undefined

function ObjectMapper(from_object, to_object, property_map)
{
  // There are a few different constructors - move around properties if needed
  if (typeof property_map === 'undefined') {
    property_map = to_object;
    to_object = _undefined
  }
  return map(from_object, to_object, property_map)
}

function map(from_object, to_object, property_map)
{
  // The property map is an object where the key is a string representing a notation where to look for data in an object
  //  The value is either a string, array, or object denoting how to place data into the new object
  //  The goal is to take in input and to have a standard way of passing in a list of values:
  //   from_key = array of strings representing either an object or array
  //   to_key   = array of objects where:
  //     name     = key,
  //     function = the function used to process the information for the key
  //     default  = value if there is no information about the key
  for (const [from_key, to_key] of Object.entries(property_map)) {
    var from_data = getKeyValue(from_object, from_key)
    to_object = setKeyValue(to_object, to_key, from_data)
  }
  return to_object
}

// d1[0] = 'a'
// d2[1] = 'b'
// d3[2] = 'c'

// joe.mary[].sally = d1:3
// joe.mary[].jane = e1:3
// if the data is an array, walk down the obj path and build until there is an array key

function update(obj, key_arr, data, _default, transpose)
{
  // Get the object key and index that needs to be parsed
  var [key, ix] = process(key_arr.shift())

  // If there is a key, we need to traverse down to this part of the object
  if (key) {
    // If the object is undefined, we need to create a new object
    if (obj == null) obj = {}
    // Set the key of the object equal to the recursive, or if at the end, the data
    if (key_arr.length > 0) {
      obj[key] = update(obj[key], key_arr, data, _default, transpose)
    } else {
      // This is a leaf.  Set either the data or default value into the obj
      if (data) obj[key] = data
      else if (_default) obj[key] = _default
    }
    return obj
  }

  if (ix !== null) {
    // If the top level object is undefined, we need to create a new array
    if (obj == null) obj = []
    // Make sure that there is an array item for each item in the data array
    if (Array.isArray(data)) {
      obj = data.reduce(function(o,d,i) {
        if (i == '' || i == i)
          o[i] = update(o[i], key_arr.slice(), d, _default, transpose)
        return o
      }, obj)
      return obj
    }
    // If there is more work to be done, push an object onto the array
    else {
      var x = (ix) ? ix : 0
      obj[x] = (key_arr.length > 0) ? update(obj[x], key_arr, data, _default, transpose) : (data || _default)
    }
  }

  return obj
}

function select(obj, key_arr)
{
  // Check to see if key_arr is not an array.  If so, wrap it in an array.
  // This is done for backwards compatibility from external functions that pass in a string
  if (!Array.isArray(key_arr))
    key_arr = parse(key_arr)

  // If we are at the end of the key array stack, return the object
  if (key_arr.length == 0) return obj

  // Get the object key or index that needs to be parsed
  var [key, ix] = process(key_arr.shift())

  // If there is an object key, grab the object property
  if (key) {
    // If the underlying object is an array, select the first element
    if (Array.isArray(obj) && obj.length > 0) obj = obj.shift()
    // If there is no object property associated with this key, return null
    if (!obj.hasOwnProperty(key)) return null
    // Otherwise, set the object to the object property
    var o = select(obj[key], key_arr)
    return o
  }

  // If we need to deal with an array, then loop through and return recursive select for each
  if (Array.isArray(obj)) {
    // Recursively loop through the array and grab the data
    var o = obj.map( function(o) { return select(o, key_arr.slice()) } )
    // If we are expecting an array, just return what we did
    if (ix == '') return o
    // If we are looking for a specific array element, just return that
    if (ix) return o[ix]
    // Otherwise, return the results in the first array element
    return o.shift()
  }
}

// Build an array with a data element at the given index
function build_array(data, ix=0)
{
  var arr = Array()
  var i = (ix) ? ix : 0
  arr[i] = data
  return arr
}

// Turns a key string (like key1.key2[].key3 into ['key1','key2','[]','key3']...)
// 
function parse(key, delimiter = '.') {
    // If the to_key is a string, just process the single to_key
    if (typeof(to_key) == 'string')
      to_object = update(to_object, to_key, from_data)
    // If the to_key is an object, process depending on if it is an array of values or just written in object notation
    if (typeof(to_key) == 'object') {
      // If the to_key is an array, set the from_key to each of the to_keys
      if (Array.isArray(to_key))
        to_key.forEach(function(k) { to_object = update(to_object, k, from_data) })
      else {
        // Object notation
        var k = to_key.key
        if (k) to_object = update(to_object, k, from_data)
      }
    }
  
  var key_array = key.split(delimiter)
  
  var keys = key_array.reduce(function(keys,current_key) {
    var [k,ix] = process(current_key)
    if (k) keys.push(k)
    if (ix !== null) keys.push('[' + ix + ']')
    return keys
  }, [])
  return keys
}

function process(k)
{
  try {
    var [_,key,ix] = k.match(/(.*?)\[(.*?)\]/)
    return [key,ix]
  } catch (e) {
    return [k,null]
  }
}

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(obj, key_str)
{
  // String
  if (typeof(key_str) == 'string') return select(obj,parse(key_str))
  // Nothing else is valid
}

function setKeyValue(obj,key_str,data)
{
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