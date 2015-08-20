/**
 * tiny-di
 * @module binding/lazy
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _abstract = require('./abstract');

var LazyBinding = (function (_AbstractBinding) {
  _inherits(LazyBinding, _AbstractBinding);

  function LazyBinding(injector, key, path) {
    _classCallCheck(this, LazyBinding);

    _get(Object.getPrototypeOf(LazyBinding.prototype), 'constructor', this).call(this, injector, key);
    this.path = path;
  }

  _createClass(LazyBinding, [{
    key: 'load',
    value: function load() {
      return this.injector.load(this.key, this.path);
    }
  }, {
    key: '$get',
    value: function $get() {
      return this.load();
    }
  }]);

  return LazyBinding;
})(_abstract.AbstractBinding);

exports.LazyBinding = LazyBinding;
//# sourceMappingURL=../binding/lazy.js.map