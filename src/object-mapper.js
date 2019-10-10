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
  for (const from_key_str in property_map) {
    const to_key_str = property_map[from_key_str]
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
  if (key.name)
    return select_obj(obj, key, key_arr)

  // If we need to deal with an array, then loop through and return recursive select for each
  if (Array.isArray(obj))
    return select_arr(obj, key, key_arr)
}

function select_obj(obj, key, key_arr)
{
  // If the instruction is to get an object and there is an array, just select the first item in the array.
  // This should be in the map definition, but this is a solution for wonky APIs
  if (Array.isArray(obj)) obj = obj[0]

  if (key.name && obj) {
    // Match all keys in the object
    if (key.name == '*') {
      let arr = [], n=0
      for(let k in obj) {
        let o = (key_arr.length > 0) ? select(obj[k], key_arr.slice()) : obj[k]
        if (o !== null && typeof o != 'undefined')
          arr[n++] = o
      }
      if (arr.length > 0)
        return arr
    // The object has the given key
    } else if (key.name in obj) {
      if (key_arr.length > 0)
        return select(obj[key.name], key_arr)
      return obj[key.name]
    }
  }
  return null
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
    if (typeof key.ix !== 'undefined') {
      return update_arr(obj, key, data, key_arr, context)
      // If the 'add' direction is made, add the response to an array.  If the object is already there, ignore
      // if (key.add) {
      //   if (Array.isArray(obj)) return obj.push(a)
      //   if (obj == null || typeof obj == 'undefined') return [a]
      // }
      // return a
    }
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

  // If the instruction is to add any subsequent data onto the array, then do it
  if (key.add) {
    arr.push(data)
    return arr
  }

  // Make sure that there is an array item for each item in the data array
  if (Array.isArray(data)) {
    arr = data.reduce(function(o,d,i) {
      if (key.ix == '' || key.ix == i) {
        o[i] = (key_arr.length > 0) ? update(o[i], d, key_arr.slice(), context) : d
        return o
      }
    }, arr)
    return arr
  }
  // If there is more work to be done, push an object onto the array
  else {
    const x = (key.ix) ? key.ix : 0
    arr[x] = (key_arr.length > 0) ? update(arr[x], data, key_arr, context) : data
  }

  return arr
}
  
function set_data(obj, key, data, context)
{
  // If the object is undefined, we need to create a new object
  obj = obj || {}

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
  if (typeof data !== 'undefined' && key && key.name) {
    if (data !== null || key.nulls)
      obj[key.name] = data
  }

  return obj
}

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(obj, key_str)
{
  return select(obj, parse(key_str) )
}

function setKeyValue(obj, key_str, data, context = {})
{
  // Key_str is undefined - call set_data in case there is a default or transformation to deal with
  if (typeof key_str == 'undefined' || key_str == null)
    return set_data(obj, key_str, data, context)

  // Key_str is an array of values.  Loop through each and try individually
  if (Array.isArray(key_str)) {
    for (let i=0; i<key_str.length; i++) {
      // There are an array of strings.  Loop through each one and set the value.
      if (typeof key_str[i] == 'string') {
        // The value is in string notation - recurse
        obj = setKeyValue(obj, key_str[i], data, context)
      } else if (Array.isArray(key_str[i])) {
        // The value is in array notation - recurse
        let [k,t,d] = key_str[i]
        if (typeof t !== 'undefined') context.transform = t
        if (typeof d !== 'undefined') context.default = d
        obj = setKeyValue(obj, k, data, context)
      } else {
        // The value is in object notation - recurse
        if (typeof key_str[i].transform !== 'undefined') context.transform = key_str[i].transform
        if (typeof key_str[i].default !== 'undefined') context.default = key_str[i].default
        // If the value of the key is an array, parse the array.  If this is parsed in a recursion, it is confused with arrays containing multiple values
        if (Array.isArray(key_str[i].key)) {
          let [k,t,d] = key_str[i].key
          if (typeof t !== 'undefined') context.transform = t
          if (typeof d !== 'undefined') context.default = d
          obj = setKeyValue(obj, k, data, context)
        } else
          obj = setKeyValue(obj, key_str[i].key, data, context)
      }
    }
  } else {
    if (typeof key_str == 'string')
        // The value is in string notation - ready for update!
        obj = update(obj, data, parse(key_str), context)
    else {
        // The value is in object notation - recurse
        if (typeof key_str.transform !== 'undefined') context.transform = key_str.transform
        if (typeof key_str.default !== 'undefined') context.default = key_str.default
        // If the value of the key is an array, parse the array.  If this is parsed in a recursion, it is confused with arrays containing multiple values
        if (Array.isArray(key_str.key)) {
          let [k,t,d] = key_str.key
          if (typeof t !== 'undefined') context.transform = t
          if (typeof d !== 'undefined') context.default = d
          obj = setKeyValue(obj, k, data, context)
        } else
          obj = setKeyValue(obj, key_str.key, data, context)
    }
  }
  return obj
}

// Turns a key string (like key1.key2[].key3 into ['key1','key2','[]','key3']...)
// 
function parse(key_str, delimiter = '.')
{
  // Return null if the key_str is null
  if (key_str == null)
    return null

  // Split the key_array and allowing escapes
  const key_arr = split(key_str, delimiter)
  //const key_arr = key_str.split(delimiter)
  let keys = []
  let n = 0
  for (let i=0; i<key_arr.length; i++) {
    // Build a object which is either an object key or an array
    //  Note that this is not the most readable, but it is fastest way to parse the string (at this point in time)
    let name_begin=-1, name_end=-1, ix_begin=-1, ix_end=-1, o = {}, a = {}, k = key_arr[i]
    for (let j=0; j<k.length; j++) {
      switch (k[j]) {
        case '[' :
          ix_begin = j+1
          name_end = j
          break
        case ']' :
          ix_end = j
          break
        case '+' :
          if (ix_end == j-1) a.add = true
          break
        case '?' :
          name_end = j
          if (ix_end == -1) o.nulls = true
          break
        default :
          if (ix_begin == -1) name_end = j+1
      }
    }
    if (name_end > 0) {
      o.name = k.substring(name_begin, name_end)
      keys[n++] = o
    }
    if (ix_end > 0) {
      a.ix = k.substring(ix_begin, ix_end)
      keys[n++] = a
    }
  }

  return keys
} 

// Perform the same function as split(), but keep track of escaped delimiters
function split(str, delimiter)
{
  let arr = [], n = 0
  , esc = -99
  , s = ''

  for (let i=0; i<str.length; i++) {
    switch(str[i]) {
      case delimiter :
        if (esc !== (i-1)) {
          arr[n++] = s
          s = ''
        } else s += str[i]
        break
      case '\\' :
        // Escaping a backslash
        if (esc == (i-1)) {
          esc = -99
          s += str[i-1] + str[i]
        } else 
          esc = i
        break
      default :
        if (esc == (i-1))
          s += str[i-1]
        s += str[i]
    }
  }
  arr[n++] = s
  return arr
}

module.exports = ObjectMapper
module.exports.merge = ObjectMapper
module.exports.getKeyValue = getKeyValue
module.exports.setKeyValue = setKeyValue
module.exports.parse = parse
module.exports.split = split
// module.exports.merge = ObjectMapper;