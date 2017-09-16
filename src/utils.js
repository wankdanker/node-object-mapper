module.exports = {
  /**
   * Check if next key is a array lookup
   * @param keys
   * @returns {boolean}
   * @private
   */
  _isNextArrayProperty: function (keys) {
    var regArray = /(\[\]|\[(.*)\])$/g
      ;
    return regArray.test(keys[0]);
  },

  /**
   * Check if passed object is empty, checking for object and array types
   * @param object
   * @returns {boolean}
   * @private
   */
  _isEmpty: function (object) {
    var empty = false;
    if (typeof object === 'undefined' || object === null) {
      empty = true;
    } else if (this._isEmptyObject(object)) {
      empty = true;
    } else if (this._isEmptyArray(object)) {
      empty = true;
    }

    return empty;
  },

  /**
   * Check if passed object is empty
   * @param object
   * @returns {boolean}
   * @private
   */
  _isEmptyObject: function (object) {
    return typeof object === 'object'
      && Array.isArray(object) === false
      && Object.keys(object).length === 0
      ;
  },

  /**
   * Check if passed array is empty or with empty values only
   * @param object
   * @returns {boolean}
   * @private
   */
  _isEmptyArray: function(object) {
    return Array.isArray(object)
      && (object.length === 0
      || object.join('').length === 0)
      ;
  }
};
