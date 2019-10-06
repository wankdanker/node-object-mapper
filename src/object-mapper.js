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
  // loop through the property map key array, and place the contents in the from Object into the to Object
  for (const [from_key, to_key] of Object.entries(property_map)) {
    var from_data = select(from_object, from_key)
    to_object = update(to_object, to_key, from_data)
  }
  return to_object
}

// d1[0] = 'a'
// d2[1] = 'b'
// d3[2] = 'c'

// joe.mary[].sally = d1:3
// joe.mary[].jane = e1:3
// if the data is an array, walk down the obj path and build until there is an array key

function update(obj, key_arr, data)
{
  // Check to see if key_arr is not an array.  If so, wrap it in an array.
  // This is done for backwards compatibility from external functions that pass in a string
  if (!Array.isArray(key_arr))
    key_arr = parse(key_arr)

  // // If we are at the end of the key array stack, return the leaf data either as an object property or in an array
  // if (key_arr.length == 0) return Array.isArray(obj) ? [data] : data

  // Get the object key and index that needs to be parsed
  var [key, ix] = process(key_arr.shift())

  // If there is a key, we need to traverse down to this part of the object
  if (key) {
    // If the object is undefined, we need to create a new object
    if (obj == null) obj = {}
    // Set the key of the object equal to the recursive, or if at the end, the data
    obj[key] = (key_arr.length > 0) ? update(obj[key], key_arr, data) : data
    // return the newly created object to the top
    return obj
  }

  if (ix !== null) {
    // If the top level object is undefined, we need to create a new array
    if (obj == null) obj = []
    // Make sure that there is an array item for each item in the data array
    if (Array.isArray(data)) {
      obj = data.reduce(function(o,d,i) {
        if (i == '' || i == i)
          o[i] = update(o[i], key_arr.slice(), d)
        return o
      }, obj)
      return obj
    }
    // If there is more work to be done, push an object onto the array
    else {
      var x = (ix) ? ix : 0
      obj[x] = data
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

function process(k)
{
  try {
    var [orig,key,ix] = k.match(/(.*?)\[(.*?)\]/)
    return [key,ix]
  } catch (e) {
    return [k,null]
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
function parse(key, delimiter = '.') {
  var key_array = key.split(delimiter)
  
  var keys = key_array.reduce(function(keys,current_key) {
    var [k,ix] = process(current_key)
    if (k) keys.push(k)
    if (ix !== null) keys.push('[' + ix + ']')
    return keys
  }, [])
  return keys
}


module.exports = ObjectMapper
module.exports.select = select
module.exports.update = update
module.exports.process = process
module.exports.parse = parse 
module.exports.getKeyValue = select
module.exports.setKeyValue = update
// module.exports.merge = ObjectMapper;


