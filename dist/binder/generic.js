/**
 * tiny-di
 * @module binder/generic
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

var _bindingLazy = require('../binding/lazy');

var GenericBinder = (function (_AbstractBase) {
  function GenericBinder() {
    _classCallCheck(this, GenericBinder);

    if (_AbstractBase != null) {
      _AbstractBase.apply(this, arguments);
    }
  }

  _inherits(GenericBinder, _AbstractBase);

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