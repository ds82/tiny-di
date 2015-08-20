/**
 * tiny-di
 * @module binding/provider
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

var ProviderBinding = (function (_AbstractBinding) {
  _inherits(ProviderBinding, _AbstractBinding);

  function ProviderBinding(injector, key, fn) {
    _classCallCheck(this, ProviderBinding);

    _get(Object.getPrototypeOf(ProviderBinding.prototype), 'constructor', this).call(this, injector, key);
    this.fn = fn;
  }

  _createClass(ProviderBinding, [{
    key: '$get',
    value: function $get(requestedBy) {
      return this.fn(requestedBy, this.injector, this.key);
    }
  }]);

  return ProviderBinding;
})(_abstract.AbstractBinding);

exports.ProviderBinding = ProviderBinding;
//# sourceMappingURL=../binding/provider.js.map