/**
 * @ngdoc overview
 * @name de.ds82.juice
 */

class TinyDi {
  constructor() {
    this.bindings = {};
    this.layzBindings = {};
    this.resolverFn = function(file){
      return require(file);
    };
  }

  setResolver(resolverFn) {
    this.resolverFn = resolverFn;
  }

  bind(key) {
    return new Binding(this, key);
  }

  set(key, object) {
    this.bindings[key] = object;
  }

  setLazyBinding(key, path) {
    this.layzBindings[key] = path;
  }

  lazy(key) {
    key = this.layzBindings[key] || key;
    var resolved = this.resolverFn(key);

    if (resolved) {
      var object = this.apply(resolved);
      this.set(key, object);
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
    this.injector.set(this.key, this.injector.lazy(file));
  }
}

module.exports = TinyDi;

