/**
 * tiny-di
 * @module binding/lazy
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

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