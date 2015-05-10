'use strict';

module.exports = Some;

Some.$inject = ['VALUE'];
function Some(value) {

  if (!(this instanceof Some)) {
    return new Some(value);
  }

  var pub = this;
  pub.get = get;

  function get(base) {
    return base + value;
  }

}
