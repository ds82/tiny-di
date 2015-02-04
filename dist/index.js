"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

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
      throw new TypeError("Array.prototype.find called on null or undefined");
    }
    if (typeof predicate !== "function") {
      throw new TypeError("predicate must be a function");
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
    this.resolving = [];

    this.bindings = {};
    this.nsBindings = [];

    this.resolverFn = this.getDefaultResolver();
  }

  _prototypeProperties(TinyDi, null, {
    getDefaultResolver: {
      value: function getDefaultResolver() {
        return function (file) {
          return require(file);
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    resolveKey: {
      value: function resolveKey(key) {
        if (this.hasBinding(key)) {
          return key;
        }

        var moduleDelimiter = String(key).lastIndexOf("/");
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    hasBinding: {
      value: function hasBinding(key) {
        return !!this.bindings[key];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setResolver: {
      value: function setResolver(resolverFn) {
        this.resolverFn = resolverFn;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    bind: {
      value: function bind(key) {
        return new Binding(this, key);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    ns: {
      value: function ns(space) {
        return new PathBinding(this, space);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setNsBinding: {
      value: function setNsBinding(ns, dir) {
        this.nsBindings.push({ ns: ns, path: dir });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    set: {
      value: function set(key, object) {
        this.bindings[key] = object;
        return object;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    load: {
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    lazy: {
      value: function lazy(key) {
        if (this.isCircularDep(key)) {
          // console.log('tried to resolve:', this.resolving);
          throw new Error("Circular dependency found; abort loading");
        }
        return this.load(key, key);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getBinding: {
      value: function getBinding(key) {
        var binding = this.bindings[key];
        if (binding instanceof Lazy) {
          return binding.load();
        }
        return binding;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    get: {
      value: function get(key) {
        return this.bindings[key] ? this.getBinding(key) : this.lazy(key);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    apply: {
      value: function apply(fn, that) {
        if (fn && fn.$inject && typeof fn === "function") {
          var argumentList = fn.$inject.map(this.get, this);
          return fn.apply(that, argumentList);
        }
        return fn;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    markResolving: {
      value: function markResolving(key) {
        this.resolving.push(key);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    markResolved: {
      value: function markResolved(key) {
        var index = this.resolving.indexOf(key);
        if (index > -1) {
          this.resolving.splice(index, 1);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    isCircularDep: {
      value: function isCircularDep(key) {
        // console.log('isCircularDep', key, this.resolving.indexOf(key));
        return this.resolving.indexOf(key) > -1;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return TinyDi;
})();

var Lazy = (function () {
  function Lazy(injector, key, path) {
    this.injector = injector;
    this.key = key;
    this.path = path;
  }

  _prototypeProperties(Lazy, null, {
    load: {
      value: function load() {
        return this.injector.load(key, path);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Lazy;
})();

var Binding = (function () {
  function Binding(injector, key) {
    this.injector = injector;
    this.key = key;
  }

  _prototypeProperties(Binding, null, {
    to: {
      value: function to(object) {
        this.injector.set(this.key, object);
        return this.injector;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    lazy: {
      value: function lazy(path) {
        var lazyBind = new Lazy(this.injector, this.key, path);
        this.injector.set(this.key, lazyBind);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    apply: {
      value: function apply(fn) {
        this.injector.set(this.key, this.injector.apply(fn));
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    load: {
      value: function load(file) {
        return this.injector.set(this.key, this.injector.get(file));
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Binding;
})();

var PathBinding = (function () {
  function PathBinding(injector, key) {
    this.injector = injector;
    this.key = key;
  }

  _prototypeProperties(PathBinding, null, {
    to: {
      value: function to(dir) {
        this.injector.setNsBinding(this.key, dir);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return PathBinding;
})();

module.exports = function () {
  return new TinyDi();
};
//# sourceMappingURL=index.js.map