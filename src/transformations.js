'use strict'

var transforms = {
  'dateTimeToDate': function (stringISODateTime) {
    if (!stringISODateTime) {
      return null
    }

    return stringISODateTime.split('T')[0]
  },
  'test-foo': function (value) {
    return value + '-foo';
  },
  'test-destination': function (val, _src, dst) {
    dst.manual = val.a + val.b;
  },
  'test-empty-array': function (sourceValue) {
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
  },
  'test-array-to-single': function (val, _src, _dst) {
    var a = val.reduce(function (i, obj) {
      return i += obj.a;
    }, '');

    return a;
  },
  'test-array-without-dest': function (val, _src, dst) {
    var a = val.reduce(function (i, obj) {
      return i += obj.a;
    }, '');

    dst.manual = a
  },
  'test-override': function () {
    return 'over-ridden-sku'
  }
}

module.exports = transforms
