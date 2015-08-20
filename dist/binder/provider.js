/**
 * tiny-di
 * @module binder/provider
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

var _bindingProvider = require('../binding/provider');

var ProviderBinder = (function (_AbstractBase) {
  _inherits(ProviderBinder, _AbstractBase);

  function ProviderBinder() {
    _classCallCheck(this, ProviderBinder);

    _get(Object.getPrototypeOf(ProviderBinder.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProviderBinder, [{
    key: 'by',
    value: function by(fn) {
      var binding = new _bindingProvider.ProviderBinding(this.injector, this.key, fn);
      this.injector.set(this.key, binding);
      return this.injector;
    }
  }]);

  return ProviderBinder;
})(_base.AbstractBase);

exports.ProviderBinder = ProviderBinder;
//# sourceMappingURL=../binder/provider.js.map