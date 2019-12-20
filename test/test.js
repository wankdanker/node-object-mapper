"use strict";

//const om = require('object-mapper')
const om = require('../')
  , test = require('tape')
  // , performance = require('perf_hooks').performance

test('SPLIT with complicated key', function (t) {
  var k = 'abc.def.ghi.j..k\\.l\\\\.m.'
  var expect = ['abc','def','ghi','j','','k.l\\\\','m','']
  var result = om.split(k, '.')
  t.deepEqual(result, expect);
  t.end();
});
  
test('PARSE with complicated key', function (t) {
  var k = 'abc[].def[42]+.ghi?.j..k\\.l\\\\.m.'
  var expect = [{name: 'abc'},{ix: ''},{name: 'def'},{ix: '42', add: true},{name: 'ghi', nulls: true},{name: 'j'},{name: 'k.l\\\\'},{name: 'm'}]
  var result = om.parse(k, '.')
  t.deepEqual(result, expect);
  t.end();
});
  
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
test('MAP with empty default on missing key', function (t) {
  var obj = {foo: 'bar'}
  var map = {'undefined_key': {key:'key_with_default', default:''}}
  var expect = {key_with_default: ''}

  var result = om(obj, map);
  t.deepEqual(result, expect);
  t.end();
});
test('MAP with null default on missing key', function (t) {
  var obj = {foo: 'bar'}
  var map = {'undefined_key': {key:'key_with_default', default: null}}
  var expect = {key_with_default: null}

  var result = om(obj, map);
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

test('get value - simple array negative index', function (t) {
  var obj = ['foo', 'bar'];
  var map = '[-1]';
  var expect = 'bar';
  var result = om.getKeyValue(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('get value - simple array dot property', function (t) {
  var obj = [{ name: 'foo' }, { name: 'bar' }];
  var map = '[-1].name';
  var expect = 'bar';
  var result = om.getKeyValue(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('get value - simple array negative index falls off array', function (t) {
  var obj = ['foo', 'bar'];
  var map = '[-3]';
  var expect = null;
  var result = om.getKeyValue(obj, map);

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

test('get value - crazy negative', function (t) {
  var key = 'foo.baz[-1].fog[1].baz';

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
  var data = 'bar';

  var expect = [, , , {
    foo: 'bar'
  }];

  var result = om.setKeyValue(null, key, data);

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

test('mapping - map and append full array to existing mapped array', function (t) {
  var obj = {
    thing : [
      {a: 'a1', b: 'b1'}
      , {a: 'a2', b: 'b2'}
      , {a: 'a3', b: 'b3'}
    ],
    thingOther:[{a: 'a4', b: 'b4'}
    , {a: 'a5', b: 'b5'}
    , {a: 'a6', b: 'b6'}]
  };

  var map = {
    'thing' : 'thing2[]+',
    'thingOther' : 'thing2[]+',
  };

  var expect = {thing2:
    [
      [ { a: 'a1', b: 'b1' }, { a: 'a2', b: 'b2' }, { a: 'a3', b: 'b3' } ],
      [ { a: 'a4', b: 'b4' }, { a: 'a5', b: 'b5' }, { a: 'a6', b: 'b6' } ]
    ]}

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

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

test('Object is created when it should not be #57', function (t) {
  var obj = {}
  var expect
  const map = { key1: "a.b.c" }

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});
test('Multi-level array issue #29', function (t) {
  var orig = {
    foo: [
        {"name": "a", "things": ["a1", "a2"]},
        {"name": "b", "things": ["b1", "b2"]}
    ]
  }
  var map = {
    "foo[].name": "bar[].label",
    "foo[].things[]": "bar[].values[]"
  };
    
  var expect = {bar: [{
    label: "a",
    values: ["a1", "a2"]
    },
    {
    label: "b",
    values: ["b1", "b2"]
  }]}
  
  var result = om(orig, map);

  t.deepEqual(result, expect);
  t.end();
});


test('Ensure that boolean values work for both arrays and objects #37', function (t) {
  var to_obj = {
    test: 1
  };

  var from_obj = {
    "foo": {
      "bar": false,
      "baz": [1,2,'three',false]
    }
  };

  var map = {
    'foo.bar': { key: 'baz' },
    'foo.baz': 'biff'
  };

  var expect = {
    test: 1,
    baz: false,
    biff: [1,2,'three',false]
  };


  var result = om(from_obj, to_obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Ensure that multi-dimentional arrays work #41', function (t) {
  var src = {
    "arr": [
        {
            "id": 1
        }
    ]
  };
  
  var expect = null
  var result = om.getKeyValue(src, "arr[].arr[].id");

  t.deepEqual(result, expect);
  t.end();
});

test('Ensure that multi-dimentional arrays work #41', function (t) {
  var src = {
    "arr": [
        {
            "id": 1
        }
    ]
  };
  
  var map = {
    "arr[].id": "arr[].id",
    "arr[].arr[].id": "arr[].arr[].id",
    "arr[].arr[].arr[].id": "arr[].arr[].arr[].id"
  };
  
  var expect = {"arr":[{"id":1}]};


  var result = om(src, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Make sure no objects are created without data #48', function (t) {
  var obj = {
    "a" : 1234,
    "foo": {
      "bar": null
    }
  };
  
  var expect = {
    foo:{
      a:1234
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

// test('1 array mapping wraps destination in an unwanted array #49', function (t) {
//   const src = {
//     foo: [{ bar: 4 }, { bar: 33 }],
//     bifoo: [{ bar: 77 }, { bar: 97 }]
//   };
//   const mapper = {
//     "foo[].bar": "[]+",
//     "bifoo[].bar": "[]+"
//   }
//   var expect = [4, 33, 77, 97];
//   var result = om(src, mapper);
//   t.deepEqual(result, expect);
//   t.end();
// });
// test('2 array mapping wraps destination in an unwanted array #49', function (t) {
//   const src = {
//     foo: [{ bar: 4 }, { bar: 33 }],
//     bifoo: [{ bar: 77 }, { bar: 97 }]
//   };
//   const mapper2 = {
//     "foo[].bar": "num[]+",
//     "bifoo[].bar": "num[]+"
//   }
//   var expect = {num: [4, 33, 77, 97] };
//   var result = om(src, mapper2);
//   t.deepEqual(result, expect);
//   t.end();
// });

// test('Including parent items in arrays #50', function (t) {
//   const src = {
//     "a": "AA",
//     "b": "BB",
//     "array": [
//         { "x": "one" },
//         { "x": "two" }
//     ]
// };
//   const map = {
//     "array[].x": "results[].ex",
//     "a": "results[].aye",
//     "b": "results[].bee"
// }
//   var expect = {
//     "results": [
//         {
//             "aye": "AA",
//             "bee": "BB",
//             "ex": "one"
//         },
//         {
//             "aye": "AA",
//             "bee": "BB",
//             "ex": "two"
//         }
//     ]
// };
//   var result = om(src, map);
//   t.deepEqual(result, expect);
//   t.end();
// });

// test('2 array mapping wraps destination in an unwanted array #49', function (t) {
//   const src = {
//     "firstName": "S",
//     "lastName": "J",
//     "Alias": [{
//         "firstName": "S111",
//         "lastName": "J111"
//     }, {
//         "firstName": "S111222",
//         "lastName": "J1222211"
//     }],
//     "address": [
//         {
//             "streetName": "",
//             "city": "S2"
//         },
//         {
//             "streetName": "karve",
//             "city": "pune"
//         }
//     ]
// };
//   const map = {
//     "firstName": "Name[].FirstName",
//      "lastName": "Name[].LastName",
//      "Alias[].firstName": "Name[].FirstName",
//      "Alias[].lastName": "Name[].LastName",
//      "address[].streetName": "Address[].StreetName",
//      "address[].city": "Address[].City"
//  }
//   var expect = {
//     "Name": [
//         {
//             "FirstName": "S",
//             "LastName": "J"
//         },
//         {
//             "FirstName": "S111",
//             "LastName": "J111"
//         },
//         {
//             "FirstName": "S111222",
//             "LastName": "J1222211"
//         }
//     ],
//     "Address": [
//         {
//             "StreetName": "",
//             "City": "S2"
//         },
//         {
//             "StreetName": "karve",
//             "City": "pune"
//         }
//     ]
// };
//   var result = om(src, map);
//   t.deepEqual(result, expect);
//   t.end();
// });

test('Should correctly map to a subelement of indexed array item.', function (t) {
  var obj = {
    "nodes": [
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

  var expect = {
    "result": [ {
      "env": {
        "nodes": [
          {
            "type": "db",
            "image": "mongodb"
          },
          {
            "type": "app",
            "image": "nginx"
          }]
      }
    }]
  };
  var map = {
    'nodes[].type': 'result[0].env.nodes[].type',
    'nodes[].image': 'result[0].env.nodes[].image'
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('Should correctly map to a subelement of indexed array item deep in the object hierarchy.', function (t) {

  var obj = {
    policyNumber: "PN1",
    status: "ST1",
    productName: "PN1",
    productVersion: "PV1",
    productType: "PT1",
    startDate: "SD1",
    endDate: "ED1",
    policyContacts: [
      {
        contactType: "CT11",
        contactId: "CI11"
      },
      {
        contactType: "CT12",
        contactId: "CI12"
      }
    ],
    currency: "CUR1",
    covers: [
      {
        coverName: "CN11",
        coverId: "CID11",
        startDate: "SD11",
        endDate: "ED11",
        excess: "EX11",
        insuredAmount: "IA11",
        yearlyPremium: "YP11",
        status: "ST11"
      }
    ],
    riskObjects: [
      {
        assetId: "AID11",
        type: "T11",
        assetDescription: "AD11",
        address: {
          city: "C11",
          houseNumber: "HN11",
          country: "CN11",
          zipCode: "ZC11",
        }
      }
    ]

  };

  var expect = {
    policyHeader: [
      {
        policiesList: {
          policies: {
            externalPolicyNr: "PN1",
            policyLobsList: {
              policyLobs: {
                lobRef: {
                  value: "PT1"
                },
                policyLobAssetsList: {
                  policyLobAssets: [
                    {
                      coversList: {
                        covers: [
                          {
                            coverPerilsList: {
                              coverPerils: [
                                {
                                  perilRef: {
                                    value: "CN11"
                                  }
                                }
                              ]
                            },
                            externalNumber: "CID11",
                            startDate: "SD11",
                            endDate: "ED11",
                            excessAmount: "EX11",
                            insuranceAmount: "IA11",
                            basicYearlyPremiumAmount: "YP11",
                            coverStatusRef: {
                              value: "ST11"
                            }
                          }
                        ]
                      },
                      originalLobAssetId: "AID11",
                      asset: {
                        assetTypeRef: {
                          value: "T11"
                        },
                        propertyOccupationTypeRef: "AD11",
                        address: {
                          cityName: "C11",
                          houseNr: "HN11",
                          countryRef: {
                            value: "CN11"
                          },
                          zipCode: "ZC11"

                        }

                      }
                    }
                  ]

                }
              }
            },
            policyContactsList: {
              policyContacts: [
                {
                  policyContactRoleRef: {
                    value: "CT11"
                  },
                  contactExtNum: "CI11"
                },
                {
                  policyContactRoleRef: {
                    value: "CT12"
                  },
                  contactExtNum: "CI12"
                },
              ]
            }
          }
        },
        statusCodeRef: {
          value: "ST1"
        },
        productRef: {
          value: "PN1"
        },
        productVersionRef: {
          value: "PV1"
        },
        policyStartDate: "SD1",
        policyEndDate: "ED1",
        currencyRef: {
          value: "CUR1"
        }
      }
    ]
  };

  var map = {
    "covers[].coverId": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].externalNumber",
    "covers[].coverName": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].coverPerilsList.coverPerils[0].perilRef.value",
    "covers[].endDate": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].endDate",
    "covers[].excess": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].excessAmount",
    "covers[].insuredAmount": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].insuranceAmount",
    "covers[].startDate": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].startDate",
    "covers[].status": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].coverStatusRef.value",
    "covers[].yearlyPremium": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].coversList.covers[].basicYearlyPremiumAmount",
    "currency": "policyHeader[0].currencyRef.value",
    "endDate": "policyHeader[0].policyEndDate",
    "policyContacts[].contactId": "policyHeader[0].policiesList.policies.policyContactsList.policyContacts[].contactExtNum",
    "policyContacts[].contactType": "policyHeader[0].policiesList.policies.policyContactsList.policyContacts[].policyContactRoleRef.value",
    "policyNumber": "policyHeader[0].policiesList.policies.externalPolicyNr",
    "productName": "policyHeader[0].productRef.value",
    "productType": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.lobRef.value",
    "productVersion": "policyHeader[0].productVersionRef.value",
    "riskObjects[].address.city": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].asset.address.cityName",
    "riskObjects[].address.country": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].asset.address.countryRef.value",
    "riskObjects[].address.houseNumber": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].asset.address.houseNr",
    "riskObjects[].address.zipCode": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].asset.address.zipCode",
    "riskObjects[].assetDescription": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].asset.propertyOccupationTypeRef",
    "riskObjects[].assetId": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].originalLobAssetId",
    "riskObjects[].type": "policyHeader[0].policiesList.policies.policyLobsList.policyLobs.policyLobAssetsList.policyLobAssets[].asset.assetTypeRef.value",
    "startDate": "policyHeader[0].policyStartDate",
    "status": "policyHeader[0].statusCodeRef.value"
  };

  var result = om(obj, map);

  t.deepEqual(result, expect);
  t.end();
});

test('MAP Should correctly create an array and add if undlerlying data structure is object #64', function (t) {
  var src = {foo: {bar: 'baz'}}
  var map = { 'foo[].bar': 'abc[].def' }
  var expect = { abc: [ {def: 'baz'} ] }
  var result = om(src, map)

  t.deepEqual(result, expect)
  t.end()
});



test("MAP Should correctly apply transform in array data #68", t => {
  var src = {
    test: ["1234", "5678", "9101"]
  };
  var map = {
    "test[]": {
      key: "check[]",
      transform: val => parseInt(val)
    }
  };
  var expect = {
    check: [1234, 5678, 9101]
  };
  var result = om(src, map);

  t.deepEqual(result, expect);
  t.end();
});
