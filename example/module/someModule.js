'use strict';

module.exports = Module;

Module.$inject = ['lib/somelib'];
function Module(calculator) {

  if (!(this instanceof Module)) {
    return new Module(calculator);
  }

  var pub = this;

  pub.calc = calc;

  function calc(foo) {
    return calculator.get(foo);
  }
}
