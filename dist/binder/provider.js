/**
 * tiny-di
 * @module binder/provider
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _base = require('../base');

var _bindingProvider = require('../binding/provider');

var ProviderBinder = (function (_AbstractBase) {
  function ProviderBinder() {
    _classCallCheck(this, ProviderBinder);

    if (_AbstractBase != null) {
      _AbstractBase.apply(this, arguments);
    }
  }

  _inherits(ProviderBinder, _AbstractBase);

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