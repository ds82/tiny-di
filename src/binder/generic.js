/**
 * tiny-di
 * @module binder/generic
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import { AbstractBase } from '../base';
import { LazyBinding } from '../binding/lazy';

import { isFunction } from '../utils';

export class GenericBinder extends AbstractBase {
  to(object, opts) {
    const value = isFunction(object)
      ? this.injector.load(object, object, opts)
      : object;
    this.injector.set(this.key, value);
    return this.injector;
  }

  lazy(path, opts) {
    var lazyBind = new LazyBinding(this.injector, this.key, path, opts);
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
