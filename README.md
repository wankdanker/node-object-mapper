node-object-mapper
------------------

This module provides a way to copy properties from one object to another based 
on a separate object which defines how the properties should be mapped. That 
separate mapping object is a simple object like:

```javascript
{
  "name" : "firstName"
  , "address" : "emailAddress"
}
```

You may specify properties deep within the source object to be copied to 
properties deep within the destination object by using dot notation in the 
mapping like:

```javascript
{
  "name" : "user.authentication.name"
  , "account.salt" :  "user.authentication.salt"
}
```

Objects will be automatically created where they do not exist on the destination 
object.

You may also specify defaults and transforms in two different ways:

```javascript
//with an object specifying key, transform and default
{
  "name" : { 
    key : "firstName"
    , transform : function (value, objFrom, objTo) {
      /*
       * Value returned from `transform` will override `objTo.firstName` only
       * if it's is not `undefined`, otherwise `default` will be tried.
       */
      return typeof value === 'string' ? value : undefined;
    }
    , default : function (objFrom, objTo) {
      /*
       * Value returned from `default` will override `objTo.firstName` only
       * if it's not `undefined` and `objFrom.name` is `undefined`, otherwise
       * `objTo.firstName` will remain unchanged.
       */
      return objFrom.county === "US" ? "John" : undefined;
    }
  , "address" : "emailAddress"
}

//or with an array like [key, transform, default]
{
  "name" : { 
    key : ["firstName", function (value, objFrom, objTo) {
      return "this returned value will always over ride objTo.firstName";
    }, function (objFrom, objTo) {
      return "this returned value will only over-ride objTo.firstName if objFrom.name is null or undefined";
    }]
  , "address" : "emailAddress"
}
```




methods
------------

### .merge(sourceObject, destinationObject, mapObject); 

Copy properties from **sourceObject** to **destinationObject** by following the 
mapping defined by **mapObject**

 - **sourceObject** is the object FROM which properties will be copied.
 - **destinationObject** is the object TO which properties will be copied.
 - **mapObject** is the object which defines how properties are copied from 
**sourceObject** to **destinationObject**

### .getKeyValue(obj, key);

Get the key value within **obj**, going deep within the object if necessary. 
This method is used internally but is exposed because it may be of use elsewhere 
with other projects.

 - **obj** is the object from which you would like to get a property/key value.
 - **key** is the name of the property/key you would like to retrieve.

### .setKeyValue(obj, key, value);

Set the key value within **obj**, going deep within the object if necessary.This 
method is used internally but is exposed because it may be of use elsewhere with 
other projects.

 - **obj** is the object within which the property/key will be set.
 - **key** is the name of the property/key which will be set.
 - **value** is the value of the property/key.

example
------------

```javascript
merge = require('object-mapper').merge;

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
  "sku" : "Envelope.Request.Item.SKU"
  , "upc" : "Envelope.Request.Item.UPC"
  , "title" : "Envelope.Request.Item.ShortTitle"
  , "description" : "Envelope.Request.Item.ShortDescription"
  , "length" : "Envelope.Request.Item.Dimensions.Length"
  , "width" : "Envelope.Request.Item.Dimensions.Width"
  , "height" : "Envelope.Request.Item.Dimensions.Height"
  , "inventory.onHandQty" : "Envelope.Request.Item.Inventory"
};

var result = merge(obj, {}, map);

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

use case
-------------

I use **node-object-mapper's** `merge()` method to map values from records 
returned from a database into horribly complex objects that will be eventually 
turned in to XML. 


license
----------

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