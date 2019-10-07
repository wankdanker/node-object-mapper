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
  }
}

module.exports = transforms
