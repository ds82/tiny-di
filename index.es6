/**
 * @ngdoc overview
 * @name de.ds82.juice
 */
class Juice {
  constructor() {
    this.bindings = {};
  }

  bind(key) {
    return new Binding(this, key);
  }

  set(key, object) {
    this.bindings[key] = object;
  }

  get(key) {
    return this.bindings[key];
  }

  apply(fn, that) {
    var argumentList = fn.$inject.map(this.get, this);
    return fn.apply(that, argumentList);
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
}

module.exports = Juice;
