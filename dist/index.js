/**
 * tiny-di
 * @module tiny-di
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _base = require('./base');

var _binderGeneric = require('./binder/generic');

var _binderPath = require('./binder/path');

var _binderProvider = require('./binder/provider');

var _bindingAbstract = require('./binding/abstract');

var _bindingLazy = require('./binding/lazy');

var path = require('path');

//
// Array.prototype.find polyfill
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/find
//
function findPolyfill(list, predicate) {
  if (!list) {
    throw new TypeError('find called with null or undefined list');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }
  var length = list.length >>> 0;
  var value;

  for (var i = 0; i < length; i++) {
    value = list[i];
    if (predicate.call(list, value, i, list)) {
      return value;
    }
  }
  return undefined;
}

var find = Array.hasOwnProperty('find') ? [].find.call : findPolyfill;

var TinyDi = (function () {
  function TinyDi() {
    _classCallCheck(this, TinyDi);

    this.resolving = [];

    this.bindings = {};
    this.nsBindings = [];

    this.resolverFn = this.getDefaultResolver();
  }

  _createClass(TinyDi, [{
    key: 'bind',

    //
    // PUBLIC DI API
    //

    value: function bind(key) {
      return new _binderGeneric.GenericBinder(this, key);
    }
  }, {
    key: 'ns',
    value: function ns(space) {
      return new _binderPath.PathBinder(this, space);
    }
  }, {
    key: 'get',
    value: function get(key, env) {
      return this.bindings[key] ? this.getBinding(key, env) : this.lazy(key);
    }
  }, {
    key: 'provide',
    value: function provide(key) {
      return new _binderProvider.ProviderBinder(this, key);
    }
  }, {
    key: 'setResolver',
    value: function setResolver(resolverFn) {
      this.resolverFn = resolverFn;
    }
  }, {
    key: 'set',
    value: function set(key, object) {
      this.bindings[key] = object;
      return object;
    }
  }, {
    key: 'getDefaultResolver',

    //
    // HELPER
    //

    value: function getDefaultResolver() {
      return function (file) {
        var filePath = path.join(path.dirname(require.main.filename), file);
        try {
          return require(filePath);
        } catch (error1) {
          try {
            return require(file);
          } catch (error2) {
            console.log('ERROR: Cannot load module', file);
            console.log('tried to require `' + filePath + '` and `' + file + '`');
          }
        }
      };
    }
  }, {
    key: 'resolveKey',
    value: function resolveKey(key) {
      if (this.hasBinding(key)) {
        return key;
      }

      var moduleDelimiter = String(key).lastIndexOf('/');
      var prefix = key.substring(0, moduleDelimiter);
      var suffix = key.substring(moduleDelimiter);

      if (prefix && prefix.length) {

        var ns = find(this.nsBindings, function (element) {
          return element.ns.match(prefix);
        });

        if (ns) {
          return ns.path + suffix;
        }
      }

      return key;
    }
  }, {
    key: 'hasBinding',
    value: function hasBinding(key) {
      return !!this.bindings[key];
    }
  }, {
    key: 'setNsBinding',
    value: function setNsBinding(ns, dir) {
      this.nsBindings.push({ ns: ns, path: dir });
    }
  }, {
    key: 'load',
    value: function load(key, what) {
      what = what || key;
      what = this.resolveKey(what);
      var resolved = this.resolverFn(what);

      if (resolved) {
        this.markResolving(key);
        var object = this.apply(resolved, { key: key, binding: what });
        this.set(key, object);
        this.markResolved(key);
        return object;
      }
    }
  }, {
    key: 'lazy',
    value: function lazy(key) {
      if (this.isCircularDep(key)) {
        throw new Error('Circular dependency found; abort loading');
      }
      return this.load(key, key);
    }
  }, {
    key: 'getBinding',
    value: function getBinding(key, env) {
      var binding = this.bindings[key];
      if (binding instanceof _bindingAbstract.AbstractBinding) {
        return binding.$get(env);
      }
      return binding;
    }
  }, {
    key: 'apply',
    value: function apply(fn, env, that) {
      var self = this;

      if (fn && fn.$inject && typeof fn === 'function') {
        var isArray = Array.isArray(fn.$inject);
        var rawArgs = isArray ? fn.$inject : fn.$inject.deps || [];

        var returnAsClass = !isArray && fn.$inject.callAs === 'class';
        var argumentList = rawArgs.map(_get, this);

        return returnAsClass ? new (Function.prototype.bind.apply(fn, [null].concat(argumentList)))() : fn.apply(that, argumentList);
      }

      function _get(arg) {
        return self.get(arg, env);
      }

      return fn;
    }
  }, {
    key: 'markResolving',
    value: function markResolving(key) {
      this.resolving.push(key);
    }
  }, {
    key: 'markResolved',
    value: function markResolved(key) {
      var index = this.resolving.indexOf(key);
      if (index > -1) {
        this.resolving.splice(index, 1);
      }
    }
  }, {
    key: 'isCircularDep',
    value: function isCircularDep(key) {
      return this.resolving.indexOf(key) > -1;
    }
  }]);

  return TinyDi;
})();

module.exports = function () {
  return new TinyDi();
};
//# sourceMappingURL=index.js.map