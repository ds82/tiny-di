/**
 * tiny-di
 * @module tiny-di
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */

var path = require('path');
const { version } = require('../package.json');

import { GenericBinder } from './binder/generic';
import { PathBinder } from './binder/path';
import { ProviderBinder } from './binder/provider';

import { AbstractBinding } from './binding/abstract';
import {
  isFunction,
  pipeM,
  map,
  partition,
  isPromise,
  head,
  resolveAll,
  resolve
} from './utils';

export type TFunctionWithDependency = Function & { $inject: string[] };

type TOpts = {
  bindings?: {
    [key: string]: any;
  };
};

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const isResolveNotFalse = opts =>
  Boolean(opts) === false || (opts && opts.resolve !== false);

const toDependencyWithOpts = dependency =>
  Array.isArray(dependency) ? dependency : [dependency, {}];

const isThenable = thing =>
  thing !== undefined && thing.then && isFunction(thing.then);

class Injector {
  version = version;
  logger = console.log;

  resolving = [];
  bindings = {};
  nsBindings = [];

  resolverFn = this.getDefaultResolver();

  constructor() {}

  //
  // PUBLIC DI API
  //
  setLogger(logger) {
    this.logger = logger;
  }

  private throwWhenArgsMissmatch(args) {
    if (args.length > 0) {
      throw new Error(
        'You called bind*() with more than one parameter. You probably want to use something like `tiny.bind("x").to("y")`'
      );
    }
  }

  bind(key, ...args) {
    this.throwWhenArgsMissmatch(args);
    return new GenericBinder(this, key);
  }

  bindSync(key, ...args) {
    this.throwWhenArgsMissmatch(args);
    return new GenericBinder(this, key, { sync: true });
  }

  ns(space) {
    return new PathBinder(this, space);
  }

  get(key, env, opts: TOpts = {}) {
    const _bindings = opts.bindings || {};
    const bindings = { ...this.bindings, ..._bindings };

    if (Array.isArray(key)) {
      return key.map(_key => this.get(_key, env, opts), this);
    }

    const value = bindings[key]
      ? this.getBinding(key, env, bindings)
      : this.load(key, key, opts);

    // ! TODO check if value should be resolved or not
    return isThenable(value) ? Promise.resolve(value) : value;
  }

  getSync(key, env?, opts: TOpts = {}) {
    const _bindings = opts.bindings || {};
    const bindings = { ...this.bindings, ..._bindings };

    if (Array.isArray(key)) {
      return key.map(_key => this.getSync(_key, env, opts), this);
    }

    return bindings[key]
      ? this.getBindingSync(key, env, bindings)
      : this.lazy(key, opts);
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

  getDefaultResolver(req = require) {
    const APP_ROOT = path.dirname(require.main.filename);

    return function(file) {
      const filePath = path.join(APP_ROOT, file);
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

  resolveKey(key = '') {
    if (this.hasBinding(key)) {
      return key;
    }

    const prefix = this.nsBindings.find(prefix => {
      const re = new RegExp('^' + escapeRegExp(prefix.ns) + '/');
      return key === prefix.ns || !!String(key).match(re);
    });

    if (prefix) {
      const re = new RegExp('^' + escapeRegExp(prefix.ns));
      return String(key).replace(re, prefix.path);
    }
    return key;
  }

  hasBinding(key) {
    return this.bindings[key] !== undefined;
  }

  setNsBinding(ns, dir) {
    this.nsBindings.push({ ns: ns, path: dir });
  }

  load(key, what, opts) {
    const _markResolved = object => {
      this.set(key, object);
      this.markResolved(key);
      return object;
    };

    const _what = this.resolveKey(what || key);
    const resolved = isFunction(_what) ? _what : this.resolverFn(_what);

    if (resolved) {
      this.markResolving(key);

      const value = this.apply(
        resolved,
        { key: key, binding: _what },
        null,
        opts
      );

      return isThenable(value)
        ? value.then(_markResolved)
        : _markResolved(value);
    } else {
      return this.hasBinding(_what)
        ? this.bindings[_what]
        : Promise.reject(`load: could not load ${key}`);
    }
  }

  loadSync(key, what, opts) {
    const _what = this.resolveKey(what || key);
    const resolved = isFunction(_what) ? _what : this.resolverFn(_what);

    if (resolved) {
      this.markResolving(key);
      var object = this.applySync(
        resolved,
        { key: key, binding: _what },
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
    return this.loadSync(key, key, opts);
  }

  getBinding(key, env, bindings = this.bindings) {
    var binding = bindings[key];
    if (binding instanceof AbstractBinding) {
      return binding.$get(env);
    }
    return binding;
  }

  getBindingSync(key, env, bindings = this.bindings) {
    var binding = bindings[key];
    if (binding instanceof AbstractBinding) {
      return binding.$getSync(env);
    }
    return binding;
  }

  apply(_fn, env, that, opts) {
    const self = this;
    const fn = _fn.default ? _fn.default : _fn;

    if (fn && fn.$inject && isFunction(fn)) {
      const hasDeps = Boolean(fn.$inject) && Array.isArray(fn.$inject);
      const deps = map(toDependencyWithOpts)(hasDeps ? fn.$inject : []);
      const isClass = fn.$type && fn.$type === 'class';

      return pipeM(
        map(([dependencyId, dependencyOpts]) => [
          self.get(dependencyId, env, opts),
          { id: dependencyId, ...dependencyOpts }
        ]),
        map(([dependency, dependencyOpts]) => {
          return isResolveNotFalse(dependencyOpts) && isPromise(dependency)
            ? dependency.then(d => [d, dependencyOpts])
            : [dependency, dependencyOpts];
        }),
        resolveAll,
        map(head),
        args => {
          return isClass
            ? new (Function.prototype.bind.apply(fn, [null].concat(args)))()
            : fn.apply(that, args);
        },
        resolve
      )(deps);
    }

    // fallback
    return fn;
  }

  applySync(_fn, env, that, opts) {
    const self = this;

    // support es6 default exports
    const fn = _fn.default ? _fn.default : _fn;

    if (fn && fn.$inject && typeof fn === 'function') {
      var isArray = Array.isArray(fn.$inject);
      var rawArgs = isArray ? fn.$inject : fn.$inject.deps || [];

      var returnAsClass = !isArray && fn.$type === 'class';
      var argumentList = rawArgs.map(arg => self.getSync(arg, env, opts), this);

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

const init = () => new Injector();

export default init;

module.exports = function() {
  return new Injector();
};
