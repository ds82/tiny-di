/**
 * @ngdoc overview
 * @name de.ds82.juice
 */

class TinyDi {
  constructor() {
    this.bindings = {};
    this.layzBindings = {};
    this.resolving = [];
    this.resolverFn = function(file){
      return require(file);
    };
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

  set(key, object) {
    this.bindings[key] = object;
    return object;
  }

  setLazyBinding(key, path) {
    this.layzBindings[key] = path;
  }

  lazy(key) {
    var load = this.layzBindings[key] || key;
    if (this.hasBinding(load)) {
      return this.get(load);
    }

    if (this.isCircularDep(load)) {
      // console.log('tried to resolve:', this.resolving);
      throw new Error('Circular dependency found; abort loading');
    }
    var resolved = this.resolverFn(load);

    if (resolved) {
      this.markResolving(key);
      var object = this.apply(resolved);
      this.set(key, object);
      this.markResolved(key);
      return object;
    }
  }

  get(key) {
    return (this.bindings[key]) ?
      this.bindings[key] :
      this.lazy(key);
  }

  apply(fn, that) {

    if (fn && fn.$inject) {
      var argumentList = fn.$inject.map(this.get, this);
      return fn.apply(that, argumentList);
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
    // console.log('isCircularDep', key, this.resolving.indexOf(key));
    return (this.resolving.indexOf(key) > -1);
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
    this.injector.setLazyBinding(this.key, path);
  }

  apply(fn) {
    this.injector.set(this.key, this.injector.apply(fn));
  }

  load(file) {
    this.injector.setLazyBinding(this.key, file);
    return this.injector.set(this.key, this.injector.get(file));
  }
}

module.exports = TinyDi;

