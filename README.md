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
      return "this returned value will always over ride objTo.firstName";
    }
    , default : function (objFrom, objTo) {
      return "this returned value will only over-ride objTo.firstName if objFrom.name is null or undefined";
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

Array objects mapping is also supported, but requires the Array brackets on both sides of mapping entry.


```javascript
//input
{
  inspired_by : ["node", "object", "mapper"],
  limited_to  : [],
  modified_by : [
    {name: "John", change_id: "1", files: 6, title: "Added Arrays support"},
    {name: "Jane", change_id: "2", files: 5, title: "Fixed some bugs"},
    {name: "Josh", change_id: "3", files: 4, title: "Removed redundant files"}
  ]
}
//array mapping scenarios
{
  // whole array mapping
  "inspired_by" : "Result.Package.InspiredByArray",
  // string members to objects mapping
  "inspired_by[i]" : "Result.Package.InspiredBy[i].module",
  // empty array copy
  "limited_to[i]" : "Result.Package.LimitedTo[i]",
  // object members properties to strings array mapping
  "modified_by[i].name" : "Result.Package.Contributors[i]",
  // using arrays with transform function
  "modified_by[i]" : {key: "Result.Package.ChangeSummaries[i]",
    transform: transform: function(member, objFrom, objTo) {
      return member.name + ': ' member.title.substr(0, 10) + '...';
    }
  }
};

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

arrays example (with constants)
------------

```javascript
var obj = {
  inspired_by : ["node", "object", "mapper"],
  limited_to  : [],
  modified_by : [
    {name: "John", change_id: "1", files: 6, title: "Added Arrays support"},
    {name: "Jane", change_id: "2", files: 5, title: "Fixed some bugs"},
    {name: "Josh", change_id: "3", files: 4, title: "Removed redundant files"}
  ]
};

var map = {
  "\"NPM Module\"" : "Result.Package.Type", // Constant value mapping example
  "inspired_by" : "Result.Package.InspiredByArray",
  "inspired_by[i]" : "Result.Package.InspiredBy[i].module",
  "limited_to[i]" : "Result.Package.LimitedTo[i]",
  "modified_by[i].name" : "Result.Package.Contributors[i]",
  "modified_by[i]" : {key: "Result.Package.ChangeSummaries[i]",
    transform: transform: function(member, objFrom, objTo) {
      return member.name + ': ' member.title.substr(0, 10) + '...';
    }
  }
};

var result = merge(obj, {}, map);

// Expected
var expected = { 
  Result: { 
    Type: "NPM Module",
    Package: { 
      InspiredByArray: ["node", "object", "mapper"],
      InspiredBy: [
        { module: "node" },
        { module: "object" },
        { module: "mapper" }
      ],
      LimitedTo: [],
      Contributors: ["John", "Jane", "Josh"],
      ChangeSummaries: [
        "John: Added Arra...",
        "Jane: Fixed some...",
        "Josh: Removed re..."
      ]
    } 
  } 
};
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