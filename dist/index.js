"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

/**
 * @ngdoc overview
 * @name de.ds82.juice
 */

var TinyDi = (function () {
  function TinyDi() {
    this.bindings = {};
    this.layzBindings = {};
    this.resolving = [];

    this.resolverFn = function (file) {
      return require(file);
    };
  }

  _prototypeProperties(TinyDi, null, {
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
    set: {
      value: function set(key, object) {
        this.bindings[key] = object;
        return object;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setLazyBinding: {
      value: function setLazyBinding(key, path) {
        this.layzBindings[key] = path;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    lazy: {
      value: function lazy(key) {
        var load = this.layzBindings[key] || key;

        if (this.hasBinding(load)) {
          return this.get(load);
        }

        if (this.isCircularDep(load)) {
          // console.log('tried to resolve:', this.resolving);
          throw new Error("Circular dependency found; abort loading");
        }

        var resolved = this.resolverFn(load);

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
    get: {
      value: function get(key) {
        return this.bindings[key] ? this.bindings[key] : this.lazy(key);
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
        this.injector.setLazyBinding(this.key, path);
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
        this.injector.setLazyBinding(this.key, file);
        return this.injector.set(this.key, this.injector.get(file));
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Binding;
})();

module.exports = TinyDi;