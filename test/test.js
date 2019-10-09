"use strict";

//const om = require('object-mapper')
const om = require('../')
  , test = require('tape')
  , performance = require('perf_hooks').performance

test('PARSE with simple key', function (t) {
  var k = 'abc'
  var expect = [{name: 'abc'}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});

test('PARSE abc? (simple key allowing nulls)', function (t) {
  var k = 'abc?'
  var expect = [{name: 'abc', nulls: true}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});

test('PARSE with simple empty array key', function (t) {
  var k = 'abc[]'
  var expect = [{name: 'abc'}, {ix: ''}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with no key empty array key', function (t) {
  var k = '[]'
  var expect = [{ix: ''}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with nothing', function (t) {
  var k = ''
  var expect = []
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with simple dot notation key', function (t) {
  var k = 'abc.def'
  var expect = [{name: 'abc'}, {name: 'def'}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with deep dot notation key', function (t) {
  var k = 'a.b.c.d.e.f'
  var expect = [{name: 'a'},{name: 'b'},{name: 'c'},{name: 'd'},{name: 'e'},{name: 'f'}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with deep brackets', function (t) {
  var k = 'abc[].def'
  var expect = [{name: 'abc'},{ix: ''},{name: 'def'}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with deep brackets and instruction to add together', function (t) {
  var k = 'abc[]+.def'
  var expect = [{name: 'abc'},{ix: '', add: true},{name: 'def'}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with deep brackets and instruction to add nulls', function (t) {
  var k = 'abc[]+.def?'
  var expect = [{name: 'abc'},{ix: '', add: true},{name: 'def', nulls: true}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
test('PARSE with deep brackets', function (t) {
  var k = '[].def'
  var expect = [{ix: ''},{name: 'def'}]
  var result = om.parse(k)
  t.deepEqual(result, expect);
  t.end();
});
// test('parse with a slashed dot', function (t) {
//   var k = 'abc\.def'
//   var expect = ['[abc.def']
//   var result = om.parse(k)
//   t.deepEqual(result, expect);
//   t.end();
// });

test('MAP - multiple levels of array indexes on both the from and to arrays', function (t) {
  var obj =
{ Items:
    [
        { SubItems:
            [
                { SubKey: 'item 1 id a' },
                { SubKey: 'item 1 id b' }
            ]
        },
        { SubItems:
            [
                { SubKey: 'item 2 id a' },
                { SubKey: 'item 2 id b' }
            ]
        }
    ]
}
var expect =
{ items:
    [
        { subitems:
            [
                { subkey: 'item 1 id a' },
                { subkey: 'item 1 id b' },
            ]
        },
        { subitems:
            [
                { subkey: 'item 2 id a' },
                { subkey: 'item 2 id b' },
            ]
        }
    ]
}
  var map = {
    'Items[].SubItems[].SubKey': 'items[].subitems[].subkey'
  };



  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});
  

test('get value - one level deep', function (t) {

  var obj = { foo: { bar: "baz"} }
  var map = 'foo.bar'
  var expect = "baz"
  var result = om.getKeyValue(obj, map)

  t.deepEqual(result, expect)
  t.end()
});

test('get value - starting with simple array', function (t) {

  var obj = ["bar"];
  var map = '[]';
  var expect = ["bar"];
  var result = om.getKeyValue(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('get value - simple array defined index', function (t) {

  var obj = ["foo", "bar"]
  var map = '[1]'
  var expect = "bar"
  var result = om.getKeyValue(obj, map)

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
  var key = 'foo.baz[1]';

  var obj = {
    "foo": {
      "baz": ["bar", "foo"]
    }
  };

  var expect = "foo";

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});

test('get value - one level deep and array and one level', function (t) {
  var key = 'foo.baz[].fog';

  var obj = {
    "foo": {
      "baz": [{
        "fog": "bar"
      }]
    }
  };

  var expect = ["bar"];

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
test('get value - one level array', function (t) {
  var key = 'foo[]';

  var obj = {
    "foo": [{
      "baz": [{
        "fog": {
          "baz": "bar"
        }
      }]
    }]
  };

  var expect = [{
    "baz": [{
      "fog": {
        "baz": "bar"
      }
    }]
  }];

  var result = om.getKeyValue(obj, key);

  t.deepEqual(result, expect);
  t.end();
});
test('get value - two level deep array', function (t) {
  var key = 'foo[].baz[].fog.baz';

  var obj =
  { "foo":
    [
      { "baz":
        [
          { "fog": { "baz": "bar" } },
          { "fog": { "baz": "var" } }
        ]
      }
    ]
  };

  var expect = [["bar", "var"]];

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

test('select with array object where map is not an array 1', function (t) {
  var obj = { foo: [{bar: 'a'}, {bar: 'b'}, {bar: 'c'}] }
  var map = 'foo.bar'
  var expect = 'a'
  var result = om.getKeyValue(obj, map)
  t.deepEqual(result, expect)
  t.end()
})

test('select with array object where map is not an array 2', function (t) {
  var obj = { foo: [{bar: 'a'}, {bar: 'b'}, {bar: 'c'}] }
  var map = 'foo[].bar'
  var expect = ['a','b','c']
  var result = om.getKeyValue(obj, map)
  t.deepEqual(result, expect);
  t.end();
});

test('set value - simple', function (t) {
  var key = 'foo';
  var value = 'bar';
  var expect = {
    foo: "bar"
  };

  var result = om.setKeyValue(null, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple with base object', function (t) {
  var key = 'foo';
  var value = 'bar';

  var base = {
    baz: "foo"
  };

  var expect = {
    baz: "foo",
    foo: "bar"
  };

  var result = om.setKeyValue(base, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple array', function (t) {
  var key = '[]';
  var value = 'bar';

  var expect = ['bar'];

  var result = om.setKeyValue(null, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple array with base array', function (t) {
  var key = '[]';
  var value = 'bar';

  var base = ['foo'];
  var expect = ['bar'];

  var result = om.setKeyValue(base, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple array in index 0', function (t) {
  var map = '[0]';
  var data = 'bar';

  var expect = ['bar'];

  var result = om.setKeyValue(null, map, data);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple array in index 0 with base array', function (t) {
  var key = '[0]';
  var value = 'bar';

  var base = ['foo'];
  var expect = ['bar'];

  var result = om.setKeyValue(base, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - simple array in index 1', function (t) {
  var map = '[1]';
  var data = 'bar';

  var expect = [, 'bar'];

  var result = om.setKeyValue(null, map, data);

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
test('set value - object inside simple array', function (t) {
  var key = '[].foo';
  var value = 'bar';

  var expect = [{
    foo: 'bar'
  }];

  var result = om.setKeyValue(null, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - array to object inside simple array', function (t) {
  var key = '[].foo';
  var value = ['bar', 'baz'];

  var expect = [
    {
      foo: 'bar'
    }
    , {
      foo: 'baz'
    }
  ];

  var result = om.setKeyValue(null, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - object inside simple array defined index', function (t) {
  var key = '[3].foo';
  var value = 'bar';

  var expect = [, , , {
    foo: 'bar'
  }];

  var result = om.setKeyValue(null, key, value);

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
test('set value - one level deep inside array with one level deep inside a existing array', function (t) {
  var key = 'foo.bar[].baz';
  var value = 'foo';

  var base = {
    foo: {
      bar: [{
        bar: 'baz'
      }]
    }
  };

  var expect = {
    foo: {
      bar: [{
        bar: 'baz'
        , baz: 'foo'
      }]
    }
  };

  var result = om.setKeyValue(base, key, value);

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
test('set value - array to simple object', function (t) {
  var key = 'foo[].baz';
  var value = ['foo', 'var'];

  var expect = {
    foo: [
      {
        baz: 'foo'
      }
      , {
        baz: 'var'
      }
    ]
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - array to two level object', function (t) {
  var key = 'bar.foo[].baz';
  var value = ['foo', 'var'];

  var expect = {
    bar: {
      foo: [
        {
          baz: 'foo'
        }
        , {
          baz: 'var'
        }
      ]
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - array to two level object', function (t) {
  var key = 'bar.foo[].baz.foo';
  var value = ['foo', 'var'];

  var expect = {
    bar: {
      foo: [
        {
          baz: {
            foo: 'foo'
          }
        }
        , {
          baz: {
            foo: 'var'
          }
        }
      ]
    }
  };

  var result = om.setKeyValue({}, key, value);

  t.deepEqual(result, expect);
  t.end();
});
test('set value - array to object', function (t) {
  var key = 'foo[].bar[].baz';
  var value = [['foo', 'var']];

  var expect = {
    foo: [{
      bar: [{
        baz: 'foo'
      }, {
        baz: 'var'
      }]
    }]
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
  var to_obj = {
    test: 1
  };

  var from_obj = {
    "foo": "bar"
  };

  var expect = {
    test: 1,
    bar: "bar",
    baz: "bar"
  };

  var map = {
    'foo': ['bar', 'baz']
  };

  var result = om(from_obj, to_obj, map);

  t.deepEqual(result, expect);
  t.end();
});
test('map object to another - with two destinations for same value inside object', function (t) {
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
      foo: {
        baz: 'baz',
        foo: 'baz'
      }
    }
  };

  var map = {
    'foo.bar': ['bar.foo.baz', 'bar.foo.foo']
  };

  var result = om(obj, baseObject, map);

  t.deepEqual(result, expect);
  t.end();
});
test('map object to another - with two destinations for same value inside array', function (t) {
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
  var to_obj = {
    test: 1
  };

  var from_obj = {
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

  var result = om(from_obj, to_obj, map);

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
      'default': 10
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

test('map object to another - when target key is undefined it should be ignored', function (t) {
  var obj = {
    "a" : 1234,
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    bar: {
      bar : "baz",
    }
  };

  var map = {
    'foo.bar' : 'bar.bar',
    'a': undefined
   };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - with key object notation with default function returning undefined when key does not exists', function (t) {
  var obj = {
    "a" : 1234,
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    bar: {
      bar : "baz",
      a : 1234
    }
  };

  var map = {
    'foo.bar' : 'bar.bar',
    'notExistingKey': {
      key: 'bar.test',
      default: function (fromObject, fromKey, toObject, toKey) {
        return undefined
      }
    },
    'a' : 'bar.a'
  };

  var result = om(obj, map);

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

test('map object to another - map object without destination key via transform', function (t) {
  var obj = {
    thing : {
      thing2 : {
        thing3 : {
          a: 'a1'
          , b: 'b1'
        }
      }
    }
  };

  var map = {
    'thing.thing2.thing3' : [[ null, function (val, src, dst) {
        dst.manual = val.a + val.b;
      }
    , null ]]
  };

  var expect = {
    'manual' : 'a1b1'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('array mapping - simple', function (t) {
  var obj = {
    "comments": [
      {a: 'a1', b: 'b1'}
      , {a: 'a2', b: 'b2'}
    ]
  };

  var map = {
    "comments[].a": ["comments[].c"]
    , "comments[].b": ["comments[].d"]
  };

  var expect = {
    "comments": [
      {c: 'a1', d: 'b1'}
      , {c: 'a2', d: 'b2'}
    ]
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('array mapping - two level deep', function (t) {
  var obj = {
    "comments": [
      {
        "data": [
          {a: 'a1', b: 'b1'}
          , {a: 'a2', b: 'b2'}
        ]
      }
    ]
  };

  var map = {
    "comments[].data[].a": "comments[].data[].c"
    , "comments[].data[].b": "comments[].data[].d"
  };

  var expect = {
    "comments": [
      {
        "data": [
          {c: 'a1', d: 'b1'}
          , {c: 'a2', d: 'b2'}
        ]
      }
    ]
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('array mapping - simple deep', function (t) {
  var obj = {
    "thing": {
      "comments": [
        {a: 'a1', b: 'b1'}
        , {a: 'a2', b: 'b2'}
      ]
    }
  };

  var map = {
    "thing.comments[].a": ["thing.comments[].c"]
    , "thing.comments[].b": ["thing.comments[].d"]
  };

  var expect = {
    "thing": {
      "comments": [
        {c: 'a1', d: 'b1'}
        , {c: 'a2', d: 'b2'}
      ]
    }
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('array mapping - from/to specific indexes', function (t) {
  var obj = {
    "comments": [
      {a: 'a1', b: 'b1'}
      , {a: 'a2', b: 'b2'}
    ]
  };

  var map = {
    "comments[0].a": ["comments[1].c"]
    , "comments[0].b": ["comments[1].d"]
  };

  var expect = {
    "comments": [
      , {c: 'a1', d: 'b1'}
    ]
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('array mapping - fromObject is an array', function (t) {
  var obj = [
    {a: 'a1', b: 'b1'}
    , {a: 'a2', b: 'b2'}
  ];

  var map = {
    '[].a': '[].c'
    , '[].b': '[].d'
  };

  var expect = [
    {c: 'a1', d: 'b1'}
    , {c: 'a2', d: 'b2'}
  ];

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('array mapping - fromObject empty array property ignored', function (t) {
  var obj = {
    phone_numbers: []
  };

  var map = {
    'phone_numbers': {
      key: 'questionnaire.initial.cellPhoneNumber',
      transform: function (sourceValue) {
        var i;

        if (!Array.isArray(sourceValue)) {
          return null;
        }

        for (i = 0; i < sourceValue.length; i++) {
          if (sourceValue[i].primary) {
            return {
              code: sourceValue[i].country_code,
              phone: sourceValue[i].number
            };
          }
        }
      }
    }
  };

  var target = {
    questionnaire: {
      initial: {}
    }
  };

  var expected = {
    questionnaire: {
      initial: {}
    }
  };

  var result = om(obj, target, map);

  t.deepEqual(result, expected);
  t.end();


});

test('mapping - map full array to single value via transform', function (t) {
  var obj = {
    thing : [
      {a: 'a1', b: 'b1'}
      , {a: 'a2', b: 'b2'}
      , {a: 'a3', b: 'b3'}
    ]
  };

  var map = {
    'thing' : [[ 'thing2', function (val, src, dst) {
        var a = val.reduce(function (i, obj) {
          return i += obj.a;
        }, '');

        return a;
      }
    , null ]]
  };

  var expect = {
    'thing2' : 'a1a2a3'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('mapping - map full array without destination key via transform', function (t) {
  var obj = {
    thing : {
      thing2 : {
        thing3 : [
          {a: 'a1', b: 'b1'}
          , {a: 'a2', b: 'b2'}
          , {a: 'a3', b: 'b3'}
        ]
      }
    }
  };

  var map = {
    'thing.thing2.thing3' : [[ null, function (val, src, dst) {
        var a = val.reduce(function (i, obj) {
          return i += obj.a;
        }, '');

        dst.manual = a
      }
    , null ]]
  };

  var expect = {
    'manual' : 'a1a2a3'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('mapping - map full array to same array on destination side', function (t) {
  var obj = {
    thing : [
      {a: 'a1', b: 'b1'}
      , {a: 'a2', b: 'b2'}
      , {a: 'a3', b: 'b3'}
    ]
  };

  var map = {
    'thing' : 'thing2'
  };

  var expect = {
    'thing2' : [
      {a: 'a1', b: 'b1'}
      , {a: 'a2', b: 'b2'}
      , {a: 'a3', b: 'b3'}
    ]
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

// test('mapping - map and append full array to existing mapped array', function (t) {
//   var obj = {
//     thing : [
//       {a: 'a1', b: 'b1'}
//       , {a: 'a2', b: 'b2'}
//       , {a: 'a3', b: 'b3'}
//     ],
//     thingOther:[{a: 'a4', b: 'b4'}
//     , {a: 'a5', b: 'b5'}
//     , {a: 'a6', b: 'b6'}]
//   };

//   var map = {
//     'thing' : 'thing2[]+',
//     'thingOther' : 'thing2[]+',
//   };

//   var expect = {
//     'thing2' : [
//       [{a: 'a1', b: 'b1'}
//       , {a: 'a2', b: 'b2'}
//       , {a: 'a3', b: 'b3'}],
//       [{a: 'a4', b: 'b4'}
//       , {a: 'a5', b: 'b5'}
//       , {a: 'a6', b: 'b6'}]
//     ]
//   };

//   var result = om(obj, map);

//   t.deepEqual(result, expect);
//   t.end();
// });

test('map object to another - prevent null values from being mapped', function (t) {
  var obj = {
    "a" : 1234,
    "foo": {
      "bar": null
    }
  };

  var expect = {
    foo:{
      a:1234
    },
    bar:{

    }
  };

  var map = {
    'foo.bar' : 'bar.bar',
    'a': 'foo.a'
   };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - allow null values', function (t) {
  var obj = {
    "a" : 1234,
    "foo": {
      "bar": null
    }
  };

  var expect = {
    foo:{
      a:1234
    },
    bar:null
  };

  var map = {
    'foo.bar' : 'bar?',
    'a': 'foo.a'
   };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('map object to another - allow null values', function (t) {
  var obj = {
    "a" : 1234,
    "foo": {
      "bar": null
    }
  };

  var expect = {
    foo:{
      a:1234
    },
    bar:{
      bar:null
    }
  };

  var map = {
    'foo.bar' : 'bar.bar?',
    'a': 'foo.a'
   };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});


test('original various tests', function (t) {
  var merge = require('../').merge;

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
    , "inventory.onHandQty": "Envelope.Request.Item.Inventory?"
    , "inventory.replenishQty": "Envelope.Request.Item.RelpenishQuantity?"
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

test('map array inside array to property', function (t) {

  var obj = {
    "orders": [{
      "foodie": {
        "first_name": "Foodie2",
        "last_name": "Foodie2"
      },
      "sort_code": "A02"
    }],
    "transfers": [{
      "type": "GIVE",
      "target_route": {
        "_id": "58e4a15607689eafed8e2841",
        "driver": "58e4a15607689eafed8e2831"
      },
      "orders": ["58e4a15807689eafed8e2d0b"]
    }]
  };

  var expect = {
    "orders": [{
      "foodie": {
        "first_name": "Foodie2",
        "last_name": "Foodie2"
      },
      "sort_code": "A02"
    }],
    "transfers": [{
      "type": "GIVE",
      "target_route": {
        "_id": "58e4a15607689eafed8e2841",
        "driver": "58e4a15607689eafed8e2831"
      },
      "orders": ["58e4a15807689eafed8e2d0b"]
    }]
  };

  // would expect this to just assign the array as a property
  var map = {
    'orders[]._id': 'orders[]._id',
    'orders[].sort_code': 'orders[].sort_code',
    'orders[].foodie._id': 'orders[].foodie._id',
    'orders[].foodie.first_name': 'orders[].foodie.first_name',
    'orders[].foodie.last_name': 'orders[].foodie.last_name',
    'transfers[].type': 'transfers[].type',
    'transfers[].orders[]': 'transfers[].orders',
    'transfers[].target_route._id': 'transfers[].target_route._id',
    'transfers[].target_route.driver': 'transfers[].target_route.driver'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Mapping destination property with a literal dot', function (t) {
  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    "bar.baz": "baz"
  };

  var map = {
    'foo.bar': {
      key: 'bar\\.baz',
      transform: function (value, fromObject, toObject, fromKey, toKey) {
        return value;
      }
    }
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Mapping destination property with wrong escaped dot', function (t) {

  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    "bar": {"baz": "baz"}
  };

  var map = {
    'foo.bar': {
      key: 'bar\.baz', // actually equivalent to bar.baz as "bar\.baz" === "bar.baz"
      transform: function (value, fromObject, toObject, fromKey, toKey) {
        return value;
      }
    }
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Mapping destination property with two escaped dots', function (t) {
  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    "bar.baz.duz": "baz"
  };

  var map = {
    'foo.bar': {
      key: 'bar\\.baz\\.duz',
      transform: function (value, fromObject, toObject, fromKey, toKey) {
        return value;
      }
    }
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Mapping destination property with backslash itself escaped', function (t) {
  var obj = {
    "foo": {
      "bar": "baz"
    }
  };

  var expect = {
    "bar\\\\": { "baz": "baz" }
  };
  var map = {
    'foo.bar': {
      key: 'bar\\\\.baz',
      transform: function (value, fromObject, toObject, fromKey, toKey) {
        return value;
      }
    }
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Mapping properties with glob patterns', function (t) {
  var obj = {
    "nodes": {
      "db_node": {
        "type": "db",
        "image": "mongodb"
      },
      "app_node": {
        "type": "app",
        "image": "nginx"
      }
    }
  };

  var expect = {
    "types": ["db", "app"]
  };
  var map = {
    'nodes.*.type': 'types'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Mapping properties with glob patterns with incomplete path', function (t) {
  var obj = {
    "nodes": {
      "db_node": {
        "type": "db",
        "image": "mongodb"
      },
      "app_node": {
        "type": "app",
        "image": "nginx"
      }
    }
  };

  var expect = {
    "types": [
      {
        "type": "db",
        "image": "mongodb"
      },
      {
        "type": "app",
        "image": "nginx"
      }
    ]
  };
  var map = {
    'nodes.*': 'types'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('MAP - real world case multiple levels of array indexes on both the from and to arrays', function (t) {
  var obj =
  { '$attributes': { TID: '09a3a2ce-8fcb-469a-82a1-eddd60f160b9' },
  OTA_VehAvailRateRS:
   { '$attributes':
      { schemaLocation: 'http://www.opentravel.org/OTA/2008/05 OTA_VehAvailRateRS',
        Target: 'Production',
        Version: '1.0',
        SequenceNmbr: '0' },
     Success: undefined,
     VehAvailRSCore:
      { VehRentalCore:
         { '$attributes':
            { PickUpDateTime: '2019-10-06T23:42:00',
              ReturnDateTime: '2019-10-13T23:42:00' },
           PickUpLocation:
            { '$attributes': { LocationCode: 'JFK', CodeContext: 'IATA' } },
           ReturnLocation:
            { '$attributes': { LocationCode: 'JFK', CodeContext: 'IATA' } } },
        VehVendorAvails:
         { VehVendorAvail:
            { Vendor: 'Avis',
              VehAvails:
               { VehAvail:
                  [ { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '1' } },
                            VehClass: { '$attributes': { Size: '10' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group G - Chevrolet Impala or similar', Code: 'PCAR' } },
                            PictureURL: '2019-chevrolet-impala-1lt-sedan-grey.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '439.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '296.87',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '439.00',
                               EstimatedTotalAmount: '735.87',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '1' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '1' } },
                            VehClass: { '$attributes': { Size: '8' } },
                            VehMakeModel:
                             { '$attributes': { Name: 'Group E - Ford Fusion or similar', Code: 'FCAR' } },
                            PictureURL: '2019-ford-fusion-se-sedan-silver.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '649.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '366.57',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '649.00',
                               EstimatedTotalAmount: '1015.57',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '3' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '1' } },
                            VehClass: { '$attributes': { Size: '6' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group C - Toyota Corolla or similar', Code: 'ICAR' } },
                            PictureURL: '2020-toyota-corolla-le-sedan-grey.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '527.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '326.08',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '527.00',
                               EstimatedTotalAmount: '853.08',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '5' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '1' } },
                            VehClass: { '$attributes': { Size: '7' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group D - Volkswagen Jetta or similar', Code: 'SCAR' } },
                            PictureURL: '2019-volkswagen-jetta-s-sedan-grey.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '606.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '352.31',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '606.00',
                               EstimatedTotalAmount: '958.31',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '7' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '1' } },
                            VehClass: { '$attributes': { Size: '4' } },
                            VehMakeModel:
                             { '$attributes': { Name: 'Group B - Ford Focus or similar', Code: 'CCAR' } },
                            PictureURL: '2019-ford-focus-se-sedan-black.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '599.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '349.98',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '599.00',
                               EstimatedTotalAmount: '948.98',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '9' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '3' } },
                            VehClass: { '$attributes': { Size: '37' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group S - Ford Explorer AWD or similar', Code: 'RFAR' } },
                            PictureURL: '2019-ford-explorer-sport-suv-black.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '522.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '324.41',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '522.00',
                               EstimatedTotalAmount: '846.41',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '11' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '2' } },
                            VehClass: { '$attributes': { Size: '8' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group P - Ford Transit 12 Passenger or similar',
                                  Code: 'FVAR' } },
                            PictureURL: '2017-ford-transit-150-xlt-low-roof-passenger-van-white.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '1575.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '673.94',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '1575.00',
                               EstimatedTotalAmount: '2248.94',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '13' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '1' } },
                            VehClass: { '$attributes': { Size: '9' } },
                            VehMakeModel:
                             { '$attributes': { Name: 'Group H - Chrysler 300 or similar', Code: 'LCAR' } },
                            PictureURL: '2019-chrysler-300-limited-sedan-black.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '400.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '283.92',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '400.00',
                               EstimatedTotalAmount: '683.92',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '15' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '3' } },
                            VehClass: { '$attributes': { Size: '10' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group L - Chevrolet Suburban or similar',
                                  Code: 'PFAR' } },
                            PictureURL: '2019-chevrolet-suburban-1500-ls-suv-black.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '720.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '390.14',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '720.00',
                               EstimatedTotalAmount: '1110.14',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '17' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '4' } },
                            VehClass: { '$attributes': { Size: '7' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group K - Ford Mustang Convertible or similar',
                                  Code: 'STAR' } },
                            PictureURL: '2019-ford-mustang-ecoboost-convertible-black.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '700.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '383.50',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '700.00',
                               EstimatedTotalAmount: '1083.50',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '19' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '3' } },
                            VehClass: { '$attributes': { Size: '7' } },
                            VehMakeModel:
                             { '$attributes': { Name: 'Group W - Ford Edge or similar', Code: 'SFAR' } },
                            PictureURL: '2019-ford-edge-titanium-suv-grey.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '492.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '314.46',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '492.00',
                               EstimatedTotalAmount: '806.46',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '21' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '2' } },
                            VehClass: { '$attributes': { Size: '1' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group V - Chrysler Pacifica or similar', Code: 'MVAR' } },
                            PictureURL: '2019-chrysler-pacifica-lx-minivan-silver.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '654.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '368.24',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '2K' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '654.00',
                               EstimatedTotalAmount: '1022.24',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '23' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '3' } },
                            VehClass: { '$attributes': { Size: '6' } },
                            VehMakeModel:
                             { '$attributes': { Name: 'Group F - Ford Escape or similar', Code: 'IFAR' } },
                            PictureURL: '2017-ford-escape-se-suv-white.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '607.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '352.64',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '607.00',
                               EstimatedTotalAmount: '959.64',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '25' } } } } },
                    { VehAvailCore:
                       { '$attributes': { Status: 'Available' },
                         Vehicle:
                          { '$attributes': { AirConditionInd: 'true', TransmissionType: 'Automatic' },
                            VehType: { '$attributes': { VehicleCategory: '3' } },
                            VehClass: { '$attributes': { Size: '8' } },
                            VehMakeModel:
                             { '$attributes':
                                { Name: 'Group Z - Chevrolet Tahoe or similar', Code: 'FFAR' } },
                            PictureURL: '2019-chevrolet-tahoe-lt-suv-black.png' },
                         RentalRate:
                          { RateDistance:
                             { '$attributes':
                                { Unlimited: 'true',
                                  DistUnitName: 'Mile',
                                  VehiclePeriodUnitName: 'RentalPeriod' } },
                            VehicleCharges:
                             { VehicleCharge:
                                { '$attributes':
                                   { TaxInclusive: 'false',
                                     Description: 'Vehicle Rental',
                                     GuaranteedInd: 'false',
                                     IncludedInRate: 'true',
                                     Amount: '654.00',
                                     CurrencyCode: 'USD',
                                     Purpose: '1' },
                                  TaxAmounts:
                                   { TaxAmount:
                                      { '$attributes':
                                         { Total: '368.24',
                                           CurrencyCode: 'USD',
                                           Description: 'Taxes and surcharges' } } } } },
                            RateQualifier:
                             { '$attributes': { RateCategory: '3', RateQualifier: '76' } } },
                         TotalCharge:
                          { '$attributes':
                             { RateTotalAmount: '654.00',
                               EstimatedTotalAmount: '1022.24',
                               CurrencyCode: 'USD' } },
                         TPA_Extensions:
                          { Reference: { '$attributes': { Type: 'OrderByIndex', ID: '27' } } } } } ] },
              Info:
               { LocationDetails:
                  { '$attributes':
                     { AtAirport: 'true',
                       Code: 'JFK',
                       Name: 'John F Kennedy Intl Airport',
                       CodeContext: 'Rental Location',
                       ExtendedLocationCode: 'JFKT01' },
                    Address:
                     { StreetNmbr: '305 Federal Circle',
                       CityName: 'Jamaica',
                       PostalCode: '11430',
                       StateProv: { '$attributes': { StateCode: 'NY' }, '$value': 'New York' },
                       CountryName: { '$attributes': { Code: 'US' }, '$value': 'U S A' } },
                    Telephone: { '$attributes': { PhoneNumber: '(1) 718-244-5400' } } } } } } } } }
var expect =
{ tid: '09a3a2ce-8fcb-469a-82a1-eddd60f160b9',
  target: 'Production',
  version: '1.0',
  sequence_number: '0',
  pickup_datetime: '2019-10-06T23:42:00',
  return_datetime: '2019-10-13T23:42:00',
  pickup_location: 'JFK',
  return_location: 'JFK',
  vendor: 'Avis',
  vehicles:
   [ { type: '1',
       aircon: 'true',
       transmission: 'Automatic',
       class: '10',
       make_model: 'Group G - Chevrolet Impala or similar',
       make_model_code: 'PCAR',
       picture_url: '2019-chevrolet-impala-1lt-sedan-grey.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '1',
       aircon: 'true',
       transmission: 'Automatic',
       class: '8',
       make_model: 'Group E - Ford Fusion or similar',
       make_model_code: 'FCAR',
       picture_url: '2019-ford-fusion-se-sedan-silver.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '1',
       aircon: 'true',
       transmission: 'Automatic',
       class: '6',
       make_model: 'Group C - Toyota Corolla or similar',
       make_model_code: 'ICAR',
       picture_url: '2020-toyota-corolla-le-sedan-grey.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '1',
       aircon: 'true',
       transmission: 'Automatic',
       class: '7',
       make_model: 'Group D - Volkswagen Jetta or similar',
       make_model_code: 'SCAR',
       picture_url: '2019-volkswagen-jetta-s-sedan-grey.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '1',
       aircon: 'true',
       transmission: 'Automatic',
       class: '4',
       make_model: 'Group B - Ford Focus or similar',
       make_model_code: 'CCAR',
       picture_url: '2019-ford-focus-se-sedan-black.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '3',
       aircon: 'true',
       transmission: 'Automatic',
       class: '37',
       make_model: 'Group S - Ford Explorer AWD or similar',
       make_model_code: 'RFAR',
       picture_url: '2019-ford-explorer-sport-suv-black.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '2',
       aircon: 'true',
       transmission: 'Automatic',
       class: '8',
       make_model: 'Group P - Ford Transit 12 Passenger or similar',
       make_model_code: 'FVAR',
       picture_url: '2017-ford-transit-150-xlt-low-roof-passenger-van-white.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '1',
       aircon: 'true',
       transmission: 'Automatic',
       class: '9',
       make_model: 'Group H - Chrysler 300 or similar',
       make_model_code: 'LCAR',
       picture_url: '2019-chrysler-300-limited-sedan-black.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '3',
       aircon: 'true',
       transmission: 'Automatic',
       class: '10',
       make_model: 'Group L - Chevrolet Suburban or similar',
       make_model_code: 'PFAR',
       picture_url: '2019-chevrolet-suburban-1500-ls-suv-black.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '4',
       aircon: 'true',
       transmission: 'Automatic',
       class: '7',
       make_model: 'Group K - Ford Mustang Convertible or similar',
       make_model_code: 'STAR',
       picture_url: '2019-ford-mustang-ecoboost-convertible-black.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '3',
       aircon: 'true',
       transmission: 'Automatic',
       class: '7',
       make_model: 'Group W - Ford Edge or similar',
       make_model_code: 'SFAR',
       picture_url: '2019-ford-edge-titanium-suv-grey.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '2',
       aircon: 'true',
       transmission: 'Automatic',
       class: '1',
       make_model: 'Group V - Chrysler Pacifica or similar',
       make_model_code: 'MVAR',
       picture_url: '2019-chrysler-pacifica-lx-minivan-silver.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '3',
       aircon: 'true',
       transmission: 'Automatic',
       class: '6',
       make_model: 'Group F - Ford Escape or similar',
       make_model_code: 'IFAR',
       picture_url: '2017-ford-escape-se-suv-white.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' },
     { type: '3',
       aircon: 'true',
       transmission: 'Automatic',
       class: '8',
       make_model: 'Group Z - Chevrolet Tahoe or similar',
       make_model_code: 'FFAR',
       picture_url: '2019-chevrolet-tahoe-lt-suv-black.png',
       rate_distance_unlimited: 'true',
       rate_distance_units: 'Mile',
       rate_distance_period: 'RentalPeriod' } ] }
var map = {
  '$attributes.TID': 'tid',
  'OTA_VehAvailRateRS.$attributes.EchoToken': 'echo_token',
  'OTA_VehAvailRateRS.$attributes.TimeStamp': 'timestamp',
  'OTA_VehAvailRateRS.$attributes.Target': 'target',
  'OTA_VehAvailRateRS.$attributes.Version': 'version',
  'OTA_VehAvailRateRS.$attributes.SequenceNmbr': 'sequence_number',
  'OTA_VehAvailRateRS.Success': 'success',
  'OTA_VehAvailRateRS.Warnings.Warning.Language': 'warning_language',
  'OTA_VehAvailRateRS.Warnings.Warning.Type': 'warning_type',
  'OTA_VehAvailRateRS.Warnings.Warning.RecordID': 'warning_id',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehRentalCore.$attributes.PickUpDateTime': 'pickup_datetime',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehRentalCore.$attributes.ReturnDateTime': 'return_datetime',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehRentalCore.PickUpLocation.$attributes.LocationCode': 'pickup_location',
  // 'OTA_VehAvailRateRS.VehAvailRSCore.VehRentalCore.PickUpLocation.$attributes.CodeContext': 'pickup_location_context',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehRentalCore.ReturnLocation.$attributes.LocationCode': 'return_location',
  // 'OTA_VehAvailRateRS.VehAvailRSCore.VehRentalCore.ReturnLocation.$attributes.CodeContext': 'return_location_context',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.Vendor': 'vendor',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Status': 'vehicles[].status', // 0 (Available), 2 (On Request)
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehType.$attributes.VehicleCategory': 'vehicles[].type',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.$attributes.AirConditionInd': 'vehicles[].aircon',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.$attributes.TransmissionType': 'vehicles[].transmission',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehType.$attributes.VehicleCategory': 'vehicles[].type',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehType.$attributes.DoorCount': 'vehicles[].door_count',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehClass.$attributes.Size': 'vehicles[].class',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehGroup.$attributes.GroupType': 'vehicles[].group_type',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehGroup.$attributes.GroupValue': 'vehicles[].group',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehMakeModel.$attributes.Name': 'vehicles[].make_model',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.VehMakeModel.$attributes.Code': 'vehicles[].make_model_code',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.Vehicle.PictureURL': 'vehicles[].picture_url',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.RateDistance.$attributes.Unlimited': 'vehicles[].rate_distance_unlimited',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.RateDistance.$attributes.Quantity': 'vehicles[].rate_distance_quantity',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.RateDistance.$attributes.DistUnitName': 'vehicles[].rate_distance_units', // Km or Mile
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.RateDistance.$attributes.VehiclePeriodUnitName': 'vehicles[].rate_distance_period', // Rental Period, Day, Hour
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.Amount': 'vehicles[].rate_amount',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.CurrencyCode': 'vehicles[].rate_currency_code',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.TaxInclusive': 'vehicles[].rate_tax_inclusive',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.amount_description': 'vehicles[].rate_description',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.GuaranteedInd': 'vehicles[].rate_guaranteed_ind',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.IncludedInRate': 'vehicles[].rate_included_in_rate',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].$attributes.Purpose': 'vehicles[].rate_purpose', // 1 (Vehicle rental), 2 (One way fee), 5 (Upgrade), 5 (Airport/City/Other Surcharge), 5 (Airport Concession Fee), ...
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].TaxAmounts.TaxAmount.$attributes.Total': 'vehicles[].tax_amount',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].TaxAmounts.TaxAmount.$attributes.CurrencyCode': 'vehicles[].tax_currency_code',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].TaxAmounts.TaxAmount.$attributes.Description': 'vehicles[].tax_description',
  'OTA_VehAvailRateRS.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails.VehAvail[].VehAvailCore.RentalRate.VehicleCharges.VehicleCharge[].Calculation.$attributes.UnitCharge': 'vehicles[].tax_description',
}

  var result = om(obj, map);
  t.deepEqual(result, expect);
  t.end();
});
