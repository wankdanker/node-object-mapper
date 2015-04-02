var merge = require('../').merge
  , assert = require('assert')
  , inspect = require('util').inspect;

var obj = {
  "sku" : "12345"
  , "upc" : "99999912345X"
  , "title" : "Test Item"
  , "description" : ""
  , "length" : 5
  , "width" : 2
  , "height" : 8
  , "inventory" : {
    "onHandQty" : 0
    , "replenishQty" : null
  }
}

var map = {
  "sku" : "Envelope.Request.Item.SKU"
  , "upc" : "Envelope.Request.Item.UPC"
  , "title" : "Envelope.Request.Item.ShortTitle"
  , "description" : "Envelope.Request.Item.ShortDescription"
  , "length" : "Envelope.Request.Item.Dimensions.Length"
  , "width" : "Envelope.Request.Item.Dimensions.Width"
  , "height" : "Envelope.Request.Item.Dimensions.Height"
  , "weight" : [["Envelope.Request.Item.Weight", null, function () { return undefined; } ]]
  , "weightUnits" : [["Envelope.Request.Item.WeightUnits", null, function () { return null; } ]]
  , "inventory.onHandQty" : "Envelope.Request.Item.Inventory"
  , "inventory.replenishQty" : "Envelope.Request.Item.RelpenishQuantity"
  , "inventory.isInventoryItem" : { key : [ "Envelope.Request.Item.OnInventory", null, "YES" ] }
};

var expected = { 
  Envelope: { 
    Request: { 
      Item: { 
        SKU: "12345",
        UPC: "99999912345X",
        ShortTitle: "Test Item",
        ShortDescription: "",
        Dimensions: { 
          Length: 5, 
          Width: 2, 
          Height: 8 
        },
        WeightUnits : null,
        Inventory: 0,
        RelpenishQuantity: null,
        OnInventory : 'YES'
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

obj["inventory"] = null;
expected.Envelope.Request.Item.Inventory = null;

assert.deepEqual(
  merge(obj, {}, map)
  , expected
  , "Fail! Transform failed"
);

console.error("Success!");
