/**
 * tiny-di
 * @module tiny-di
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */

var path = require('path');

import { GenericBinder } from './binder/generic';
import { PathBinder } from './binder/path';
import { ProviderBinder } from './binder/provider';

import { AbstractBinding } from './binding/abstract';

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class TinyDi {
  constructor() {
    this.logger = console.log;
    this.resolving = [];

    this.bindings = {};
    this.nsBindings = [];

    this.resolverFn = this.getDefaultResolver();
  }

  //
  // PUBLIC DI API
  //
  setLogger(logger) {
    this.logger = logger;
  }

  bind(key) {
    return new GenericBinder(this, key);
  }

  ns(space) {
    return new PathBinder(this, space);
  }

  get(key, env, opts = {}) {
    const _bindings = opts.bindings || {};
    const bindings = { ...this.bindings, ..._bindings };

    if (Array.isArray(key)) {
      return key.map(function(_key) {
        return this.get(_key, env, opts);
      }, this);
    }

    return bindings[key] ? this.getBinding(key, env, bindings) : this.lazy(key);
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

  getDefaultResolver(req) {
    req = req || require;
    var APP_ROOT = path.dirname(require.main.filename);

    return function(file) {
      var filePath = path.join(APP_ROOT, file);
      try {
        return req(filePath);
      } catch (error1) {
        try {
          return req(file);
        } catch (error2) {
          this.logger('ERROR: Cannot load module', file);
          this.logger('tried to require `' + filePath + '` and `' + file + '`');
          this.logger(
            error1,
            error2,
            error1.stack.split('\n'),
            error2.stack.split('\n')
          );
        }
      }
    };
  }

  resolveKey(key) {
    if (this.hasBinding(key)) {
      return key;
    }

    const prefix = this.nsBindings.find(prefix => {
      const re = new RegExp('^' + escapeRegExp(prefix.ns) + '/');
      return key === prefix.ns || !!key.match(re);
    });

    if (prefix) {
      const re = new RegExp('^' + escapeRegExp(prefix.ns));
      return key.replace(re, prefix.path);
    }
    return key;
  }

  hasBinding(key) {
    return !!this.bindings[key];
  }

  setNsBinding(ns, dir) {
    this.nsBindings.push({ ns: ns, path: dir });
  }

  load(key, what, opts) {
    what = what || key;
    what = this.resolveKey(what);
    const resolved = typeof what === 'function' ? what : this.resolverFn(what);

    if (resolved) {
      this.markResolving(key);
      var object = this.apply(
        resolved,
        { key: key, binding: what },
        null,
        opts
      );
      this.set(key, object);
      this.markResolved(key);
      return object;
    }
  }

  lazy(key, opts) {
    if (this.isCircularDep(key)) {
      throw new Error('Circular dependency found; abort loading');
    }
    return this.load(key, key, opts);
  }

  getBinding(key, env, bindings = this.bindings) {
    var binding = bindings[key];
    if (binding instanceof AbstractBinding) {
      return binding.$get(env);
    }
    return binding;
  }

  apply(fn, env, that, opts) {
    const self = this;

    // support es6 default exports
    fn = fn.default ? fn.default : fn;

    if (fn && fn.$inject && typeof fn === 'function') {
      var isArray = Array.isArray(fn.$inject);
      var rawArgs = isArray ? fn.$inject : fn.$inject.deps || [];

      var returnAsClass = !isArray && fn.$inject.callAs === 'class';
      var argumentList = rawArgs.map(arg => self.get(arg, env, opts), this);

      return returnAsClass
        ? new (Function.prototype.bind.apply(fn, [null].concat(argumentList)))()
        : fn.apply(that, argumentList);
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
    return this.resolving.indexOf(key) > -1;
  }
}

module.exports = function() {
  return new TinyDi();
};
