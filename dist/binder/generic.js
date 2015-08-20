/**
 * tiny-di
 * @module binder/generic
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

var _base = require('../base');

var _bindingLazy = require('../binding/lazy');

var GenericBinder = (function (_AbstractBase) {
  _inherits(GenericBinder, _AbstractBase);

  function GenericBinder() {
    _classCallCheck(this, GenericBinder);

    _get(Object.getPrototypeOf(GenericBinder.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(GenericBinder, [{
    key: 'to',
    value: function to(object) {
      this.injector.set(this.key, object);
      return this.injector;
    }
  }, {
    key: 'lazy',
    value: function lazy(path) {
      var lazyBind = new _bindingLazy.LazyBinding(this.injector, this.key, path);
      this.injector.set(this.key, lazyBind);
      return this.injector;
    }
  }, {
    key: 'apply',
    value: function apply(fn) {
      this.injector.set(this.key, this.injector.apply(fn));
    }
  }, {
    key: 'load',
    value: function load(file) {
      return this.injector.set(this.key, this.injector.get(file));
    }
  }]);

  return GenericBinder;
})(_base.AbstractBase);

exports.GenericBinder = GenericBinder;
//# sourceMappingURL=../binder/generic.js.map