# object-mapper

[![Build Status](https://travis-ci.org/wankdanker/node-object-mapper.svg)](https://travis-ci.org/wankdanker/node-object-mapper) [![Join the chat at https://gitter.im/wankdanker/node-object-mapper](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wankdanker/node-object-mapper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## About

Copy properties from one `Object` to another based
on a separate `Object`, which defines how the properties should be mapped.

## Installation

```shell
$ npm install --save object-mapper
```

## Usage

A mapping object `key` is the **source** `key` and the `value` is the `key` on the **destination** object the `value` is mapped to.

### Source

The source `key` can be specified as a simple string:

```javascript
{
  "foo": "bar" //map src.foo to dest.bar
}
```

You may specify properties deep within the source `Object` to be copied to
properties deep within the destination `Object` by using dot notation in the
mapping `key`:

```javascript
{
  "foo": "bar.baz", //map src.foo to dest.bar.baz
  "bar.foo": "baz" //map src.bar.foo to dest.baz
}
```

You may also specify `Array` lookups within the source `Object` to be copied to properties deep within the destination object by using `[]` notation in the mapping:

```javascript
{
  "[].foo": "bar[]",
  "foo[].bar": "[]",
  "foo[0].bar": "baz"
}
```

### Destination

You may specify the destination as:
 - String
 - Object
 - Array

#### String

When using a `String` as the destination, use the method described above.

To utilize a source field more than once, utilize the key-transform syntax in the mapping link:

```javascript
var objectMapper = require('object-mapper');

var map = {
  "foo": [
    {
      key: "foo",
      transform: function (value) { 
        return value + "_foo";
      }
    },
    {
      key: "baz",
      transform: function (value) {
        return value + "_baz";
      }
    }
  ],
  "bar": "bar"
};

var src = {
	foo: 'blah',
	bar: 'something'
};

var dest = objectMapper(src, map);

// dest.foo: 'blah_foo'
// dest.baz: 'blah_baz'
// dest.bar: 'something' 
```

#### Object

Using an `Object` as the destination:

```javascript
{
  "key": (String),
  "transform": (Function()),
  "default": (Function()|String|Number)
}
```

##### Methods

###### transform(sourceValue, sourceObject, destinationObject, destinationKey);

Specify the mapping of a **sourceValue** as you need;

###### default(sourceObject, sourceKey, destinationObject, destinationKey);

Specify a _default_ return value when the **sourceValue** is `undefined` or `null`.

#### Array

When using an `Array` as the destination you can pass a `String`, an `Object` or another `Array` (shorthand for `Object`):

```javascript
{
  "foo": ["bar", "baz"],
  "bar": [{
    "key": "foo"
  }],
  "baz": [["bar", null, "foo"]]
}
```

If you want to append items to an existing `Array`, append a `+` after the `[]`
```javascript
{
  "sourceArray[]": {
    "key": "destination[]+",
    "transform": (val) => mappingFunction(val)
  },
  "otherSourceArray[]": {
    "key": "destination[]+",
    "transform": (val) => mappingFunction(val)
  }
}

// Results in the destination array appending the source values
{
  "destination": [
    {/*Results from the mapping function applied to sourceArray */},
    {/*Results from the mapping function applied to otherSourceArray */},
  ]
}
```

The `Array` shorthand for an `Object`:

```javascript
[(Key(String))), (Transform(Function())), (Default(String|Number|Function()))]
```

### Null Values

By default `null` values on the source `Object` is not mapped. You can override this by including the post fix operator '?' to any destination `key`.

```javascript
var original = {
  "sourceKey": null,
  "otherSourceKey": null
}

var transform = {
  "sourceKey": "canBeNull?",
  "otherSourceKey": "cannotBeNull"
}

var results = ObjectMapper(original, {}, transform);

// Results would be the following
{
  canBeNull: null
}
```

## Methods

### .merge(sourceObject[, destinationObject], mapObject);

Copy properties from **sourceObject** to **destinationObject** by following the
mapping defined by **mapObject**

This function is also exported directly from `require('object-mapper')` (ie: `var merge = require('object-mapper');`)

 - **sourceObject** is the object FROM which properties will be copied.
 - **destinationObject** [OPTIONAL] is the object TO which properties will be copied.
 - **mapObject** is the object which defines how properties are copied from
**sourceObject** to **destinationObject**

### .getKeyValue(sourceObject, key);

Get the `key` value within **sourceObject**, going deep within the object if necessary.
This method is used internally but is exposed because it may be of use elsewhere
with other projects.

 - **sourceObject** is the object from which you would like to get a property/key value.
 - **key** is the name of the property/key you would like to retrieve.

### .setKeyValue(destinationObject, key, value);

Set the `key` value within **destinationObject**, going deep within the object if necessary.This
method is used internally but is exposed because it may be of use elsewhere with
other projects.

 - **destinationObject** is the object within which the property/key will be set.
 - **key** is the name of the property/key which will be set.
 - **value** is the value of the property/key.

## Example

```javascript
var objectMapper = require('object-mapper');

var src = {
  "sku": "12345",
  "upc": "99999912345X",
  "title": "Test Item",
  "description": "Description of test item",
  "length": 5,
  "width": 2,
  "height": 8,
  "inventory": {
    "onHandQty": 12
  }
};

var map = {
  "sku": "Envelope.Request.Item.SKU",
  "upc": "Envelope.Request.Item.UPC",
  "title": "Envelope.Request.Item.ShortTitle",
  "description": "Envelope.Request.Item.ShortDescription",
  "length": "Envelope.Request.Item.Dimensions.Length",
  "width": "Envelope.Request.Item.Dimensions.Width",
  "height": "Envelope.Request.Item.Dimensions.Height",
  "inventory.onHandQty": "Envelope.Request.Item.Inventory"
};

var dest = objectMapper(obj, map);

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

## Use case

I use the **object-mapper's** `merge()` method to map values from records
returned from a database into horribly complex objects that will be eventually
turned in to XML.


## License

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
