/**
 * tiny-di
 * @module binding/abstract
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

var AbstractBinding = (function (_AbstractBase) {
  _inherits(AbstractBinding, _AbstractBase);

  function AbstractBinding() {
    _classCallCheck(this, AbstractBinding);

    _get(Object.getPrototypeOf(AbstractBinding.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AbstractBinding, [{
    key: '$get',
    value: function $get() {
      throw new Error('should be overriden by child class');
    }
  }]);

  return AbstractBinding;
})(_base.AbstractBase);

exports.AbstractBinding = AbstractBinding;
//# sourceMappingURL=../binding/abstract.js.map