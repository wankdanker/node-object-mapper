var merge = require('../').merge
  , assert = require('assert')
  , inspect = require('util').inspect;

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
    , "replenishQty" : null
  }
  , "shipping" : {
    "methods" : [
      {"name" : "DHL Global Mail (2-8 weeks)", "price" : 25}
      , {"name" : "Intl USPS w/tracking (1-3 weeks)", "price" : 35}
      , {"name" : "UPS Worldwide Express", "price" : 63}
    ]
    , "options" : []
  }
};

function shortener(shortNum) {
  return function(value, objFrom, objTo) {
    return value.substr(0, shortNum) + '...';
  }
}

var map = {
  "sku" : "Envelope.Request.Item.SKU"
  , "upc" : "Envelope.Request.Item.UPC"
  , "title" : "Envelope.Request.Item.ShortTitle"
    // Example of multiple TO values. Second with transformation.
  , "description" : [
      "Envelope.Request.Item.Description", {
        key: "Envelope.Request.Item.ShortDescription",
        transform: shortener(14)
      }
    ]
  , "length" : "Envelope.Request.Item.Dimensions.Length"
  , "width" : "Envelope.Request.Item.Dimensions.Width"
  , "height" : "Envelope.Request.Item.Dimensions.Height"
  , "inventory.onHandQty" : "Envelope.Request.Item.Inventory"
  , "inventory.replenishQty" : "Envelope.Request.Item.RelpenishQuantity"
    // Example of new array mapping with members as objects and strings
  , "shipping.methods[i].name" : [
      "Envelope.Request.Item.ShippingMethods[i].Type"
      , {
        key: "Envelope.Request.Item.ShippingMethodsShortNames[i]"
        , transform: shortener(3)
      }
    ]
    // Example of adding properties to existing array in TO
  , "shipping.methods[i].price" : "Envelope.Request.Item.ShippingMethods[i].Price"
    // Example of empty array mapping
  , "shipping.options[i]" : "Envelope.Request.Item.ShippingOptions[i]"
};

var expected = { 
  Envelope: { 
    Request: { 
      Item: { 
        SKU: "12345",
        UPC: "99999912345X",
        ShortTitle: "Test Item",
        Description: "Description of test item",
        ShortDescription: "Description of...",
        Dimensions: { 
          Length: 5, 
          Width: 2, 
          Height: 8 
        },
        Inventory: 12,
        ShippingMethods: [
          {Type: "DHL Global Mail (2-8 weeks)", Price: 25},
          {Type: "Intl USPS w/tracking (1-3 weeks)", Price: 35},
          {Type: "UPS Worldwide Express", Price: 63}
        ],
        ShippingMethodsShortNames: [
          "DHL...",
          "Int...",
          "UPS..."
        ],
        ShippingOptions: [
        ]
      } 
    } 
  } 
};

assert.deepEqual(
  merge(obj, {}, map)
  , expected
  , "Fail! Objects did not match as expected"
);


map.sku = {
  key : "Envelope.Request.Item.SKU"
  , transform : function (val, objFrom, objTo) {
      return "over-ridden-sku";
  }
}

expected.Envelope.Request.Item.SKU = "over-ridden-sku"

assert.deepEqual(
  merge(obj, {}, map)
  , expected
  , "Fail! Transform failed"
);

console.error("Success!");