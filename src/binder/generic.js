/**
 * tiny-di
 * @module binder/generic
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import {AbstractBase} from '../base';
import {LazyBinding} from '../binding/lazy';

export class GenericBinder extends AbstractBase {
  to(object) {
    this.injector.set(this.key, object);
    return this.injector;
  }

  lazy(path) {
    var lazyBind = new LazyBinding(this.injector, this.key, path);
    this.injector.set(this.key, lazyBind);
    return this.injector;
  }

  apply(fn) {
    this.injector.set(this.key, this.injector.apply(fn));
  }

  load(file) {
    return this.injector.set(this.key, this.injector.get(file));
  }
}

