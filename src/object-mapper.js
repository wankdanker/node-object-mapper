'use strict';

var _undefined

/**
 * Map a object to another using the passed map
 * @param src
 * @param [dest]
 * @param [map]
 * @returns {*}
 * @constructor
 */

function ObjectMapper(src, dest, map)
{
  // There are two different constructors - move around properties if needed
  // e.g (ObjectMapper(from,map))
  if (typeof map === 'undefined') {
    map = dest
    dest = _undefined
  }

  // Loop through the map to process individual mapping instructions
  for (const srckey in map) {
    const destkey = map[srckey]
    // Extract the data from the source object or array
    const data = getKeyValue(src, srckey)
    // Build an object with all of these parameters in case custom transform or default functions need them to derive their values
    let context = {src: src, srckey: srckey, destkey: destkey}
    // Set the data into the destination object or array format
    dest = setKeyValue(dest, destkey, data, context)
  }

  return dest
}

// A string of how to navigate through the incoming array is sent.
// This is translated into an array of instructions for the recursive object
function getKeyValue(src, keystr)
{
  // Parse the source key string into an array/object format that is easy to recurse through
  let keys = parse(keystr)
  // Select the data from the source object or array
  let data = select(src, keys)
  // Return the data for further parsing
  return data
}

// With a given source key array, select the corresponding value(s) in the source object/array.
// If the value does not exist, return null
function select(src, keys)
{
  // Get the object key or index that needs to be parsed
  const key = keys.shift()

  // The child entity is an array.  Traverse the array to obtain data
  if (key.ix !== null && typeof key.ix !== 'undefined')
    return select_arr(src, key, keys)

  // The next instruction is an object key.  Try to obtain the data for the given object key
  if (key.name)
    return select_obj(src, key, keys)

  // No data matching the instructions is found - return null
  return null
}

// Loop through the array and select the key from each value in the array.  If nothing comes back, return null
function select_arr(src, key, keys)
{
  let data = []

  // The source is not an array even though we specify array.  Grab the subnode and add to an array.
  if (!Array.isArray(src)) {
    let d = null
    // Try to get the next value in the chain.  If possible, then add to an array
    if (keys.length)
      d = select(src, keys)
    // If we found something, return it as an array
    return (d !== null) ? [ d ] : null
  }

  // Recursively loop through the array and grab the data
  for (var i=0; i<src.length; i++) {
    // Check to see if we are at a 'leaf' (no more keys to parse).  If so, return the data.  If not, recurse
    var d = (keys.length) ? select(src[i], keys.slice()) : src[i]
    // If the data is populated, add it to the array.  Make sure to keep the same array index so that traversing multi-level arrays work
    if (d !== null)
      data[i] = d
  }

  // Return the whole array if a specific index is not defined('') and there is data to return
  if (key.ix == '' && data.length)
    return data

  // Return a specific node in the array if defined
  if (key.ix && typeof negative_array_access(data, key.ix) !== 'undefined')
    return negative_array_access(data, key.ix);

  // If we are not expecting an array, return the first node - kinda hacky
  if (typeof data[0] !== 'undefined' && key.name && data[0][key.name])
    return data[0][key.name]
  
  // Otherwise, return nothing
  return null
}

// Allows negative array indexes to count down from end of array
function negative_array_access(arr, ix)
{
  var pix = parseInt(ix);
  return pix < 0 ? arr[arr.length + pix] : arr[ix];
}

// Traverse the given object for data using the given key array
function select_obj(src, key, keys)
{
  // Make sure that there is data where we are looking
  if (src && key.name) {
    
    // Match all keys in the object
    if (key.name == '*')
      return select_obj_keys(src, keys)

    // The key specifies an object.  However, the data structure is an array.  Grab the first node and continue
    if (Array.isArray(src)) {
      if (src.length && src[0])
        return (keys.length) ? select(src[0][key.name], keys) : src[0][key.name]

      return null
    }

    // The object has the given key
    if (key.name in src) {
      // There is data to be obtained
      var data = (keys.length) ? select(src[key.name], keys) : src[key.name]
      // If there is data return it
      if (data !== null)
        return data
    }
  }
  // Otherwise, return nothing
  return null
}

// Loop through all the keys in the object and select the key from each key in the object.  If nothing comes back, return null
function select_obj_keys(src, keys)
{
  let data = []
  let n=0
  // Recursively loop through the object keys and grab the data
  for (let k in src) {
    // Check to see if we are at a 'leaf' (no more keys to parse).  If so, return the data.  If not, recurse
    var d = (keys.length) ? select(src[k], keys.slice()) : src[k]
    // If the data is populated, add it to the array
    if (d !== null)
      data[n++] = d
  }

  // Return the whole data array if there is data to return
  if (data.length)
    return data

  // Otherwise, return nothing
  return null
}

// The goal of this function is to identify the different ways that this function can be called, and to structure the data uniformly before caling update()
function setKeyValue(dest, keystr, data, context = {})
{
  // Keystr is undefined - call set_data in case there is a default or transformation to deal with
  if (typeof keystr == 'undefined' || keystr == null)
    return set_data(dest, keystr, data, context)

  // Keystr is an array of values.  Loop through each and identify what format the individual values are
  if (Array.isArray(keystr)) {
    for (let i=0; i<keystr.length; i++) {

      // The substring value is in string notation - recurse with the key string
      if (typeof keystr[i] == 'string')
        dest = setKeyValue(dest, keystr[i], data, context)

      // The subtring value is in array notation - recurse with the key from the array
      else if (Array.isArray(keystr[i])) {
        let [k,t,d] = keystr[i]
        if (typeof t !== 'undefined') context.transform = t
        if (typeof d !== 'undefined') context.default = d
        dest = setKeyValue(dest, k, data, context)
      }
      
      // The substring value is in object notation - dig further
      else {
        if (typeof keystr[i].transform !== 'undefined') context.transform = keystr[i].transform
        if (typeof keystr[i].default !== 'undefined') context.default = keystr[i].default
        
        // If the substring value of the key is an array, parse the array.  If this is parsed in a recursion, it is confused with arrays containing multiple values
        if (Array.isArray(keystr[i].key)) {
          let [k,t,d] = keystr[i].key
          if (typeof t !== 'undefined') context.transform = t
          if (typeof d !== 'undefined') context.default = d
          dest = setKeyValue(dest, k, data, context)
        }
        
        // The substring value is regular object notation - recurse with the key of the substring
        else
          dest = setKeyValue(dest, keystr[i].key, data, context)
      }
    }
  }

  // The value is in string notation - ready for update!
  else if (typeof keystr == 'string')
    dest = update(dest, data, parse(keystr), context)

  // The value is in object notation - dig a bit further
  else {
    if (typeof keystr.transform !== 'undefined') context.transform = keystr.transform
    if (typeof keystr.default !== 'undefined') context.default = keystr.default
    // If the value of the key is an array, parse the array.  If this is parsed in a recursion, it is confused with arrays containing multiple values
    if (Array.isArray(keystr.key)) {
      let [k,t,d] = keystr.key
      if (typeof t !== 'undefined') context.transform = t
      if (typeof d !== 'undefined') context.default = d
      dest = setKeyValue(dest, k, data, context)
    }
    // The value is in regular object notation.  Recurse with the object key
    else
      dest = setKeyValue(dest, keystr.key, data, context)
  }

  return dest
}

// if the data is an array, walk down the obj path and build until there is an array key
function update(dest, data, keys, context)
{
  if (keys) {
    // Get the object key and index that needs to be parsed
    const key = keys.shift()

    // If there is a key, we need to traverse down to this part of the object
    if (key.name)
      return update_obj(dest, key, data, keys, context)

    // If there is an array index, we need to traverse through the array
    if (typeof key.ix !== 'undefined') {
      return update_arr(dest, key, data, keys, context)
    }
  }

  // If there is neither an array or index, we need to see if there is data to set
  return set_data(dest, keys, data, context)
}

// Update the destination object.key with the data
function update_obj(dest, key, data, keys, context)
{
  // There are further instructions remaining - we will need to recurse
  if (keys.length) {
    // There is a pre-existing destination object.  Recurse through to the object key
    if (dest !== null && typeof dest !== 'undefined') {
      let o = update(dest[key.name], data, keys, context)
      if (o !== null && typeof o !== 'undefined')
        dest[key.name] = o
    }
    // There is no pre-existing object.  Check to see if data exists before creating a new object
    else {
      // Check to see if there is a value before creating an object to store it
      let o = update(null, data, keys, context)
      if (o !== null) {
        dest = {}
        dest[key.name] = o
      }
    }
  }
  // This is a leaf.  Set data into the dest
  else
    dest = set_data(dest, key, data, context)

  return dest
}

// Update the dest[] array with the data on each index
function update_arr(dest, key, data, keys, context)
{
  // The 'add' instruction is set.  This means to take the data and add it onto a new array node 
  if (key.add) {
    if (data !== null && typeof data !== 'undefined') {
      dest = dest || []
      dest.push(applyTransform(data,dest,context))
      // dest = dest.concat(data)
    }
    return dest
  }

  // Just update a single array node
  if (key.ix !== '') {
    return update_arr_ix(dest, key.ix, applyTransform(data,dest,context), keys, context)
  }

  // If the data is in an array format then make sure that there is a dest index for each data index
  if (Array.isArray(data)) {
    dest = dest || []
    // Loop through each index in the data array and update the destination object with the data
    dest = data.reduce(function(dest,d,i) {
      // If the instruction is to update all array indices ('') or the current index, update the child data element.  Otherwise, don't bother
      if (key.ix == '' || key.ix == i) {
        return update_arr_ix(dest, i, applyTransform(d,dest,context), keys.slice(), context)
      }
    }, dest)

    return dest
  }

  // Set the specific array index with the data
  else 
    return update_arr_ix(dest, '0', data, keys, context)
}

function applyTransform(data, dest, context){
  if (typeof context.transform == 'function') {
    return context.transform(data, context.src, dest, context.srckey, context.destkey)
  }else{
    return data;
  }
}

function update_arr_ix(dest, ix, data, keys, context)
{
  let o
  if (dest !== null && typeof dest !== 'undefined' && typeof dest[ix] !== 'undefined')
    o = (keys.length) ? update(dest[ix], data, keys, context) : data
  else
    o = (keys.length) ? update(null, data, keys, context) : data

  // Only update (and create if needed) dest if there is data to be saved
  if (o !== null) {
    dest = dest || []
    dest[ix] = o
  }

  return dest
}

// Set the given data into the given destination object
function set_data(dest, key, data, context)
{
  // If there is a transformation function, call the function.
  if (typeof context.transform == 'function') {
    dest = dest || {}
    data = context.transform(data, context.src, dest, context.srckey, context.destkey)
  }

  // See if data is null and there is a default
  if (typeof context.default !== 'undefined' && (data == null || typeof data == 'undefined')) {
    // There is a default function, call the function to set the default
    if (typeof context.default == 'function') {
      dest = dest || {}
      data = context.default(context.src, context.srckey, dest, context.destkey)
    }
    // The default is a specific value
    else
      data = context.default
  }

  // Set the object to the data if it is not undefined
  if (typeof data !== 'undefined' && key && key.name) {
    // Set the data if the data is not null, or if the 'allow nulls' key is set, or if there is a default (in the case of default=null, make sure to write this out)
    if (data !== null || key.nulls || (typeof context.default !== 'undefined' && context.default == null)) {
      dest = dest || {}
      dest[key.name] = data
    }
  }

  // Return the dest variable back to the caller.
  return dest
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
