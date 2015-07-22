/**
 * tiny-di
 * @module tiny-di
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
*/

var path = require('path');

// import {AbstractBase} from './base';

import {GenericBinder} from './binder/generic';
import {PathBinder} from './binder/path';
import {ProviderBinder} from './binder/provider';

import {AbstractBinding} from './binding/abstract';
// import {LazyBinding} from './binding/lazy';

//
// include Array.find polyfill
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

class TinyDi {
  constructor() {

    this.resolving = [];

    this.bindings = {};
    this.nsBindings = [];

    this.resolverFn = this.getDefaultResolver();
  }

  //
  // PUBLIC DI API
  //

  bind(key) {
    return new GenericBinder(this, key);
  }

  ns(space) {
    return new PathBinder(this, space);
  }

  get(key, env) {
    if (Array.isArray(key)) {
      return key.map(function(_key) {
        return this.get(_key, env);
      }, this);
    }

    return (this.bindings[key]) ?
      this.getBinding(key, env) :
      this.lazy(key);
  }

  provide(key) {
    return new ProviderBinder(this, key);
  }

  setResolver(resolverFn) {
    this.resolverFn = resolverFn;
  }

   set(key, object) {
    this.bindings[key] = object;
    return object;
  }

  //
  // HELPER
  //

  getDefaultResolver() {
    return function(file) {
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

  resolveKey(key) {
    if (this.hasBinding(key)) {
      return key;
    }

    var moduleDelimiter = String(key).lastIndexOf('/');
    var prefix = key.substring(0, moduleDelimiter);
    var suffix = key.substring(moduleDelimiter);

    if (prefix && prefix.length) {
      var ns = findPolyfill(this.nsBindings, element => element.ns.match(prefix));
      if (ns) {
        return ns.path + suffix;
      }
    }

    return key;
  }

  hasBinding(key) {
    return !!this.bindings[key];
  }

  setNsBinding(ns, dir) {
    this.nsBindings.push({ns: ns, path: dir});
  }

  load(key, what) {
    what = what || key;
    what = this.resolveKey(what);
    var resolved = this.resolverFn(what);

    if (resolved) {
      this.markResolving(key);
      var object = this.apply(resolved, {key: key, binding: what});
      this.set(key, object);
      this.markResolved(key);
      return object;
    }
  }

  lazy(key) {
    if (this.isCircularDep(key)) {
      throw new Error('Circular dependency found; abort loading');
    }
    return this.load(key, key);
  }

  getBinding(key, env) {
    var binding = this.bindings[key];
    if (binding instanceof AbstractBinding) {
      return binding.$get(env);
    }
    return binding;
  }

  apply(fn, env, that) {
    var self = this;

    if (fn && fn.$inject && typeof fn === 'function') {
      var isArray = Array.isArray(fn.$inject);
      var rawArgs = (isArray) ? fn.$inject : fn.$inject.deps || [];

      var returnAsClass = !isArray && fn.$inject.callAs === 'class';
      var argumentList = rawArgs.map(arg => self.get(arg, env), this);

      return returnAsClass ?
        new (Function.prototype.bind.apply(fn, [null].concat(argumentList)))() :
        fn.apply(that, argumentList);
    }
    return fn;
  }

  markResolving(key) {
    this.resolving.push(key);
  }

  markResolved(key) {
    var index = this.resolving.indexOf(key);
    if (index > -1) {
      this.resolving.splice(index, 1);
    }
  }

  isCircularDep(key) {
    return (this.resolving.indexOf(key) > -1);
  }
}

module.exports = function() {
  return new TinyDi();
};
