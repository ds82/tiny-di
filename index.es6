/**
 * @ngdoc overview
 * @name de.ds82.juice
 */

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

var find = (Array.hasOwnProperty('find')) ?
  [].find.call : findPolyfill;

class TinyDi {
  constructor() {

    this.resolving = [];

    this.bindings = {};
    this.nsBindings = [];

    this.resolverFn = this.getDefaultResolver();
  }

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

      var ns = find(this.nsBindings, function(element) {
        return element.ns.match(prefix);
      });

      if (ns) {
        return ns.path + suffix;
      }
    }

    return key;
  }

  hasBinding(key) {
    return !!this.bindings[key];
  }

  setResolver(resolverFn) {
    this.resolverFn = resolverFn;
  }

  bind(key) {
    return new Binding(this, key);
  }

  ns(space) {
    return new PathBinding(this, space);
  }

  setNsBinding(ns, dir) {
    this.nsBindings.push({ns: ns, path: dir});
  }

  set(key, object) {
    this.bindings[key] = object;
    return object;
  }

  load(key, what) {
    what = what || key;
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

  lazy(key) {
    if (this.isCircularDep(key)) {
      throw new Error('Circular dependency found; abort loading');
    }
    return this.load(key, key);
  }

  getBinding(key) {
    var binding = this.bindings[key];
    if (binding instanceof Lazy) {
      return binding.load();
    }
    return binding;
  }

  get(key) {
    return (this.bindings[key]) ?
      this.getBinding(key) :
      this.lazy(key);
  }

  apply(fn, that) {

    if (fn && fn.$inject && typeof fn === 'function') {
      var argumentList = fn.$inject.map(this.get, this);
      return fn.apply(that, argumentList);
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

class Lazy {
  constructor(injector, key, path) {
    this.injector = injector;
    this.key = key;
    this.path = path;
  }

  load() {
    return this.injector.load(this.key, this.path);
  }
}

class Binding {
  constructor(injector, key) {
    this.injector = injector;
    this.key = key;
  }

  to(object) {
    this.injector.set(this.key, object);
    return this.injector;
  }

  lazy(path) {
    var lazyBind = new Lazy(this.injector, this.key, path);
    this.injector.set(this.key, lazyBind);
  }

  apply(fn) {
    this.injector.set(this.key, this.injector.apply(fn));
  }

  load(file) {
    return this.injector.set(this.key, this.injector.get(file));
  }
}

class PathBinding {
  constructor(injector, key) {
    this.injector = injector;
    this.key = key;
  }

  to(dir) {
    this.injector.setNsBinding(this.key, dir);
  }
}

module.exports = function() {
  return new TinyDi();
};
