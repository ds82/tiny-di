/**
 * tiny-di
 * @module binding/lazy
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import {AbstractBinding} from './abstract';

export class LazyBinding extends AbstractBinding {
  constructor(injector, key, path) {
    super(injector, key);
    this.path = path;
  }

  load() {
    return this.injector.load(this.key, this.path);
  }

  $get() {
    return this.load();
  }
}
