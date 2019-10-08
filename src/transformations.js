'use strict'

const transforms = {
  'dateTimeToDate': (stringISODateTime) => {
    if (!stringISODateTime) {
      return null
    }

    return stringISODateTime.split('T')[0]
  },
  'test-foo': (value) => {
    return value + '-foo';
  },
  'test-destination': (val, _src, dst) => {
    dst.manual = val.a + val.b;
  },
  'test-empty-array': (sourceValue) => {
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
  'test-array-to-single': (val, _src, _dst) => {
    var a = val.reduce(function (i, obj) {
      return i += obj.a;
    }, '');

    return a;
  },
  'test-array-without-dest': (val, _src, dst) => {
    var a = val.reduce(function (i, obj) {
      return i += obj.a;
    }, '');

    dst.manual = a
  },
  'test-override': () => {
    return 'over-ridden-sku'
  }
}

module.exports = transforms
