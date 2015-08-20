/**
 * tiny-di
 * @module binder/path
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

var PathBinder = (function (_AbstractBase) {
  _inherits(PathBinder, _AbstractBase);

  function PathBinder() {
    _classCallCheck(this, PathBinder);

    _get(Object.getPrototypeOf(PathBinder.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PathBinder, [{
    key: 'to',
    value: function to(dir) {
      this.injector.setNsBinding(this.key, dir);
    }
  }]);

  return PathBinder;
})(_base.AbstractBase);

exports.PathBinder = PathBinder;
//# sourceMappingURL=../binder/path.js.map