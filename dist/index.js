'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * @ngdoc overview
 * @name de.ds82.juice
 */

//
// Array.prototype.find polyfill
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/find
//
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (!this) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var TinyDi = (function () {
  function TinyDi() {
    _classCallCheck(this, TinyDi);

    this.resolving = [];

    this.bindings = {};
    this.nsBindings = [];

    this.resolverFn = this.getDefaultResolver();
  }

  _createClass(TinyDi, [{
    key: 'getDefaultResolver',
    value: function getDefaultResolver() {
      return function (file) {
        return require(file);
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

        var ns = this.nsBindings.find(function (element) {
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
    key: 'setResolver',
    value: function setResolver(resolverFn) {
      this.resolverFn = resolverFn;
    }
  }, {
    key: 'bind',
    value: function bind(key) {
      return new Binding(this, key);
    }
  }, {
    key: 'ns',
    value: function ns(space) {
      return new PathBinding(this, space);
    }
  }, {
    key: 'setNsBinding',
    value: function setNsBinding(ns, dir) {
      this.nsBindings.push({ ns: ns, path: dir });
    }
  }, {
    key: 'set',
    value: function set(key, object) {
      this.bindings[key] = object;
      return object;
    }
  }, {
    key: 'load',
    value: function load(key, what) {
      what = this.resolveKey(what);
      var resolved = this.resolverFn(what);

      if (resolved) {
        this.markResolving(key);
        var object = this.apply(resolved);
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
    value: function getBinding(key) {
      var binding = this.bindings[key];
      if (binding instanceof Lazy) {
        return binding.load();
      }
      return binding;
    }
  }, {
    key: 'get',
    value: function get(key) {
      return this.bindings[key] ? this.getBinding(key) : this.lazy(key);
    }
  }, {
    key: 'apply',
    value: function apply(fn, that) {

      if (fn && fn.$inject && typeof fn === 'function') {
        var argumentList = fn.$inject.map(this.get, this);
        return fn.apply(that, argumentList);
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

var Lazy = (function () {
  function Lazy(injector, key, path) {
    _classCallCheck(this, Lazy);

    this.injector = injector;
    this.key = key;
    this.path = path;
  }

  _createClass(Lazy, [{
    key: 'load',
    value: function load() {
      return this.injector.load(this.key, this.path);
    }
  }]);

  return Lazy;
})();

var Binding = (function () {
  function Binding(injector, key) {
    _classCallCheck(this, Binding);

    this.injector = injector;
    this.key = key;
  }

  _createClass(Binding, [{
    key: 'to',
    value: function to(object) {
      this.injector.set(this.key, object);
      return this.injector;
    }
  }, {
    key: 'lazy',
    value: function lazy(path) {
      var lazyBind = new Lazy(this.injector, this.key, path);
      this.injector.set(this.key, lazyBind);
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

  return Binding;
})();

var PathBinding = (function () {
  function PathBinding(injector, key) {
    _classCallCheck(this, PathBinding);

    this.injector = injector;
    this.key = key;
  }

  _createClass(PathBinding, [{
    key: 'to',
    value: function to(dir) {
      this.injector.setNsBinding(this.key, dir);
    }
  }]);

  return PathBinding;
})();

module.exports = function () {
  return new TinyDi();
};
//# sourceMappingURL=index.js.map