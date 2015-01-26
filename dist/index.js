"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

/**
 * @ngdoc overview
 * @name de.ds82.juice
 */
var Juice = (function () {
  function Juice() {
    this.bindings = {};
  }

  _prototypeProperties(Juice, null, {
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    get: {
      value: function get(key) {
        return this.bindings[key];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    apply: {
      value: function apply(fn, that) {
        var argumentList = fn.$inject.map(this.get, this);
        return fn.apply(that, argumentList);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Juice;
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
    }
  });

  return Binding;
})();

module.exports = Juice;