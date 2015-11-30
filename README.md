#object-mapper#

[![Build Status](https://travis-ci.org/wankdanker/node-object-mapper.svg)](https://travis-ci.org/wankdanker/node-object-mapper) [![Join the chat at https://gitter.im/wankdanker/node-object-mapper](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wankdanker/node-object-mapper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

##About##

This module provides a way to copy properties from one object to another based
on a separate object which defines how the properties should be mapped.

##Installation##

```shell
$ npm install --save object-mapper
```

##Usage##

The mapping object is a simple object, where the `key` is the **source** and the `value` is the **destination**.

###Source###

The source can be specified as a simple string like:

```javascript
{
  "foo": "bar"
}
```

You may specify properties deep within the source object to be copied to
properties deep within the destination object by using dot notation in the
mapping like:

```javascript
{
  "foo": "bar.baz"
  , "bar.foo": "baz"
}
```

You may also specify array lookups within the source object to be copied to properties deep within the destination object by using `[]` notation in the mapping link:

```javascript
{
  "[].foo": "bar[]"
  , "foo[].bar": "[]"
  , "foo[0].bar": "baz"
}
```

###Destination###

You may specify the destination as:
 - String
 - Object
 - Array

####String####

When using string as destination you shall use as described above.

In order to utilize a source field more than once, utilize the key-transform syntax in the mapping link:

```javascript
{
  "foo": [
    {
      key: "foo",
      transform: function (value) {
        return val + "_foo";
      }
    },
    {
      key: "baz",
      transform: function (value) {
        return val + "_baz"
      }
    }
  ],
  "bar": "bar"
}
```

####Object####

When using object as destination you need can use the following object:

```javascript
{
  "key": (String)
  , "transform": (Function())
  , "default": (Function()|String|Number)
}
```

#####Methods#####

###### transform(sourceValue, sourceObject, destinationObject, destinationKey);

This function let you handle the **sourceValue** as you need;

###### default(sourceObject, sourceKey, destinationObject, destinationKey);

This function let you return a _default_ value when the **sourceValue** is `undefined` or `null`.

####Array####

When using arrays as destination you can pass a string, object or another array (shorthand for object):

```javascript
{
  "foo": ["bar", "baz"]
  , "bar": [{
    "key": "foo"
  }]
  , "baz": [["bar", null, "foo"]]
}
```

If you want to append items to an existing array, include a '+' after the []
```javascript
{
  "sourceArray[]":{
    "key":"destination[]+",
    "transform": (val) => mappingFunction(val)
  },
  "otherSourceArray[]":{
    "key":"destination[]+",
    "transform:":(val) => mappingFunction(val)
  }
}
// Results in the destination array appending the source values
{
  "destination":[
    {/*Results from mapping function applied to sourceArray */},
    {/*Results from mapping function applied to otherSourceArray */},
  ]
}
```

The array shorthand for object is defined like:

```javascript
[(Key(String))), (Transform(Function())), (Default(String|Number|Function()))]
```

###Null Values###

By default any source object null value is not mapped. If you want to allow this you may do so explicitly by including the post fix operator '?' to any destination key.

```javascript
var original = {
  "sourceKey":null,
  "otherSourceKey":null
}
var transform = {
  "sourceKey":"canBeNull?",
  "otherSourceKey":"cannotBeNull"
}
var results = ObjectMapper(original, {}, transform);
// Results would be the following
{
  canBeNull:null
}
```

##Methods##

### .merge(sourceObject[, destinationObject], mapObject);

Copy properties from **sourceObject** to **destinationObject** by following the
mapping defined by **mapObject**

This function is also exported directly from `require('object-mapper')` (ie: `var merge = require('object-mapper');`)

 - **sourceObject** is the object FROM which properties will be copied.
 - **destinationObject** [OPTIONAL] is the object TO which properties will be copied.
 - **mapObject** is the object which defines how properties are copied from
**sourceObject** to **destinationObject**

### .getKeyValue(sourceObject, key);

Get the key value within **sourceObject**, going deep within the object if necessary.
This method is used internally but is exposed because it may be of use elsewhere
with other projects.

 - **sourceObject** is the object from which you would like to get a property/key value.
 - **key** is the name of the property/key you would like to retrieve.

### .setKeyValue(destinationObject, key, value);

Set the key value within **destinationObject**, going deep within the object if necessary.This
method is used internally but is exposed because it may be of use elsewhere with
other projects.

 - **destinationObject** is the object within which the property/key will be set.
 - **key** is the name of the property/key which will be set.
 - **value** is the value of the property/key.

##Example##

```javascript
var objectMapper = require('object-mapper');

var obj = {
  "sku" : "12345"
  , "upc" : "99999912345X"
  , "title" : "Test Item"
  , "description" : "Description of test item"
  , "length" : 5
  , "width" : 2
  , "height" : 8
  , "inventory" : {
    "onHandQty" : 12
  }
};

var map = {
  "sku": "Envelope.Request.Item.SKU"
  , "upc": "Envelope.Request.Item.UPC"
  , "title": "Envelope.Request.Item.ShortTitle"
  , "description": "Envelope.Request.Item.ShortDescription"
  , "length": "Envelope.Request.Item.Dimensions.Length"
  , "width": "Envelope.Request.Item.Dimensions.Width"
  , "height": "Envelope.Request.Item.Dimensions.Height"
  , "inventory.onHandQty": "Envelope.Request.Item.Inventory"
};

var result = objectMapper(obj, map);

/*
{
  Envelope: {
    Request: {
      Item: {
        SKU: "12345",
        UPC: "99999912345X",
        ShortTitle: "Test Item",
        ShortDescription: "Description of test item",
        Dimensions: {
          Length: 5,
          Width: 2,
          Height: 8
        },
        Inventory: 12
      }
    }
  }
};
*/
```

##Use case##

I use **object-mapper's** `merge()` method to map values from records
returned from a database into horribly complex objects that will be eventually
turned in to XML.


##License##

### The MIT License (MIT)


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
