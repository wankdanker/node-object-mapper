"use strict";

var om = require('../')
  , test = require('tape')
  ;

test('get value - simple', function (t) {
  var key = 'foo';

  var obj = {
    "foo": "bar"
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - one level deep', function (t) {
  var key = 'foo.baz';

  var obj = {
    "foo": {
      "baz": "bar"
    }
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - two levels deep', function (t) {
  var key = 'foo.baz.fog';

  var obj = {
    "foo": {
      "baz": {
        "fog": "bar"
      }
    }
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - one level deep and item is a array', function (t) {
  var key = 'foo.baz[]';

  var obj = {
    "foo": {
      "baz": ["bar"]
    }
  };

  var expect = ["bar"];

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - one level deep and first item of array', function (t) {
  var key = 'foo.baz[0]';

  var obj = {
    "foo": {
      "baz": ["bar"]
    }
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - one level deep and first item of array and one level', function (t) {
  var key = 'foo.baz[0].fog';

  var obj = {
    "foo": {
      "baz": [{
        "fog": "bar"
      }]
    }
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - one level deep and first item of array and two levels', function (t) {
  var key = 'foo.baz[0].fog.baz';

  var obj = {
    "foo": {
      "baz": [{
        "fog": {
          "baz": "bar"
        }
      }]
    }
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - crazy', function (t) {
  var key = 'foo.baz[0].fog[1].baz';

  var obj = {
    "foo": {
      "baz": [{
        "fog": [, {
          "baz": "bar"
        }]
      }]
    }
  };

  var expect = "bar";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});

test('set value - simple', function (t) {
  var key = 'foo';
  var value = 'bar';

  var expect = {
    foo: "bar"
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple array', function (t) {
  var key = 'foo[]';
  var value = 'bar';

  var expect = {
    foo: ["bar"]
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - one level deep', function (t) {
  var key = 'foo.bar';
  var value = 'baz';

  var expect = {
    foo: {
      bar: 'baz'
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - two levels deep', function (t) {
  var key = 'foo.bar.baz';
  var value = 'foo';

  var expect = {
    foo: {
      bar: {
        baz: 'foo'
      }
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - one level deep inside array', function (t) {
  var key = 'foo.bar[]';
  var value = 'baz';

  var expect = {
    foo: {
      bar: ['baz']
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - one level deep inside array with one level deep', function (t) {
  var key = 'foo.bar[].baz';
  var value = 'foo';

  var expect = {
    foo: {
      bar: [{
        baz: 'foo'
      }]
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - one level deep inside array at defined index with one level deep', function (t) {
  var key = 'foo.bar[1].baz';
  var value = 'foo';

  var expect = {
    foo: {
      bar: [, {
        baz: 'foo'
      }]
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - crazy', function (t) {
  var key = 'foo.bar[1].baz[2].thing';
  var value = 'foo';

  var expect = {
    foo: {
      bar: [, {
        baz: [, , {
          thing: 'foo'
        }]
      }]
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - simple', function (t) {
  var obj = {
    "foo": "bar"
  };

  var expect = {
    'bar': 'bar'
  };

  var map = {
    'foo': 'bar'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - complexity 1', function (t) {
  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    bar: {
      foo: 'baz'
    }
  };

  var map = {
    'foo.bar': 'bar.foo'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - complexity 2', function (t) {
  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    bar: {
      foo: [{
        baz: 'baz'
      }]
    }
  };

  var map = {
    'foo.bar': 'bar.foo[].baz'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with base object', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz'
      }]
    }
  };

  var map = {
    'foo.bar': 'bar.foo[].baz'
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with two destinations for same value', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz',
        foo: 'baz'
      }]
    }
  };

  var map = {
    'foo.bar': ['bar.foo[].baz', 'bar.foo[].foo']
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with three destinations for same value', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz',
        foo: 'baz',
        bar: ['baz']
      }]
    }
  };

  var map = {
    'foo.bar': ['bar.foo[].baz', 'bar.foo[].foo', 'bar.foo[].bar[]']
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key object notation', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz'
      }]
    }
  };

  var map = {
    'foo.bar': {
      key: 'bar.foo[].baz'
    }
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key object notation with default value when key does not exists', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 10
      }]
    }
  };

  var map = {
    'notExistingKey': {
      key: 'bar.foo[].baz',
      default: 10
    }
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key object notation with default function when key does not exists', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz'
      }]
    }
  };

  var map = {
    'notExistingKey': {
      key: 'bar.foo[].baz',
      default: function (fromObject, fromKey, toObject, toKey) {
        return fromObject.foo.bar;
      }
    }
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key object notation with transform', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz-foo'
      }]
    }
  };

  var map = {
    'foo.bar': {
      key: 'bar.foo[].baz',
      transform: function (value, fromObject, toObject, fromKey, toKey) {
        return value + '-foo'
      }
    }
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});


test('map object to another - with two destinations for same value one string and one object', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz',
        foo: 'baz-foo'
      }]
    }
  };

  var map = {
    'foo.bar': ['bar.foo[].baz', {
      key: 'bar.foo[].foo',
      transform: function (value, fromObject, toObject, fromKey, toKey) {
        return value + '-foo'
      }
    }]
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key array notation', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz'
      }]
    }
  };

  var map = {
    'foo.bar': [['bar.foo[].baz']]
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});
test('map object to another - with key array notation with default value when key does not exists', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 10
      }]
    }
  };

  var map = {
    'notExistingKey': [['bar.foo[].baz', null, 10]]
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key array notation with default function when key does not exists', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz'
      }]
    }
  };

  var map = {
    'notExistingKey': [['bar.foo[].baz', null, function (fromObject, fromKey, toObject, toKey) {
      return fromObject.foo.bar;
    }]]
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key array notation with transform function', function (t) {
  var baseObject = {
    test: 1
  };

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    test: 1,
    bar: {
      foo: [{
        baz: 'baz-foo'
      }]
    }
  };

  var map = {
    'foo.bar': [['bar.foo[].baz', function (value, fromObject, toObject, fromKey, toKey) {
      return value + '-foo';
    }]]
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});

test('original various tests', function (t) {
  var merge = require('../').merge

  var obj = {
    "sku": "12345"
    , "upc": "99999912345X"
    , "title": "Test Item"
    , "descriptions": ["Short description", "Long description"]
    , "length": 5
    , "width": 2
    , "height": 8
    , "inventory": {
      "onHandQty": 0
      , "replenishQty": null
    }
    , "price": 100
  };

  var map = {
    "sku": "Envelope.Request.Item.SKU"
    , "upc": "Envelope.Request.Item.UPC"
    , "title": "Envelope.Request.Item.ShortTitle"
    , "length": "Envelope.Request.Item.Dimensions.Length"
    , "width": "Envelope.Request.Item.Dimensions.Width"
    , "height": "Envelope.Request.Item.Dimensions.Height"
    , "weight": [["Envelope.Request.Item.Weight", null, function () {
      return 10;
    }]]
    , "weightUnits": [["Envelope.Request.Item.WeightUnits", null, function () {
      return null;
    }]]
    , "inventory.onHandQty": "Envelope.Request.Item.Inventory"
    , "inventory.replenishQty": "Envelope.Request.Item.RelpenishQuantity"
    , "inventory.isInventoryItem": {key: ["Envelope.Request.Item.OnInventory", null, "YES"]}
    , "price": ["Envelope.Request.Item.Price[].List", "Envelope.Request.Item.Price[].Value", "Test[]"]
    , "descriptions[0]": "Envelope.Request.Item.ShortDescription"
    , "descriptions[1]": "Envelope.Request.Item.LongDescription"
  };

  var expected = {
    Test: [100],
    Envelope: {
      Request: {
        Item: {
          SKU: "12345",
          UPC: "99999912345X",
          ShortTitle: "Test Item",
          Dimensions: {
            Length: 5,
            Width: 2,
            Height: 8
          },
          Weight: 10,
          WeightUnits: null,
          Inventory: 0,
          RelpenishQuantity: null,
          OnInventory: 'YES',
          Price: [{
            List: 100,
            Value: 100
          }],
          ShortDescription: "Short description",
          LongDescription: "Long description"
        }
      }
    }
  };

  var result = merge(obj, {}, map);

  t.deepEqual(result, expected);

  map.sku = {
    key: "Envelope.Request.Item.SKU"
    , transform: function (val, objFrom, objTo) {
      return "over-ridden-sku";
    }
  };

  expected.Envelope.Request.Item.SKU = "over-ridden-sku";

  result = merge(obj, {}, map);

  t.deepEqual(result, expected, 'override sku');


  obj["inventory"] = null;
  expected.Envelope.Request.Item.Inventory = null;

  result = merge(obj, {}, map);

  t.deepEqual(result, expected, 'null inventory');

  t.end();
});