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
}

var map = {
  "sku" : "Envelope.Request.Item.SKU"
  , "upc" : "Envelope.Request.Item.UPC"
  , "title" : "Envelope.Request.Item.ShortTitle"
  , "description" : "Envelope.Request.Item.ShortDescription"
  , "length" : "Envelope.Request.Item.Dimensions.Length"
  , "width" : "Envelope.Request.Item.Dimensions.Width"
  , "height" : "Envelope.Request.Item.Dimensions.Height"
  , "inventory.onHandQty" : "Envelope.Request.Item.Inventory"
  , "inventory.replenishQty" : "Envelope.Request.Item.RelpenishQuantity"
};

var expected = { 
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



//test array stuff

map = {
  "items[].sku" : "sku-list[]"
};

obj = {
  items : [
    { sku : "00001" }
    , { sku : "00002" }
    , { sku : "00003" }
  ]
};

expected = {
  "sku-list" : ["00001", "00002", "00003"]
}

//console.log(merge(obj, {}, map))

assert.deepEqual(
  merge(obj, {}, map)
  , expected
);

//test array source and destination notation stuff

map = {
  "items[].sku" : "sku-list[].itemNumber"
  , "stock[]" : "sku-list[].stock"
};

obj = {
  items : [
    { sku : "00001" }
    , { sku : "00002" }
    , { sku : "00003" }
  ]
  , stock : [
    300, 200, 100
  ]
};

expected = {
  "sku-list" : [
    { itemNumber : "00001", stock : 300 }
    , { itemNumber : "00002", stock : 200 }
    , { itemNumber : "00003", stock : 100 }
  ]
}


//console.log(merge(obj, {}, map));

assert.deepEqual(
  merge(obj, {}, map)
  , expected
  , "Fail! Array source and destination notation failed"
);


console.error("Success!");