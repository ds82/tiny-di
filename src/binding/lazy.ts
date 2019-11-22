/**
 * tiny-di
 * @module binding/lazy
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */

import { AbstractBinding } from './abstract';

export class LazyBinding extends AbstractBinding {
  path: any;
  opts: any;

  constructor(injector, key, _path, _opts) {
    super(injector, key);
    this.path = _path;
    this.opts = _opts;
  }

  load() {
    return this.injector.load(this.key, this.path, this.opts);
  }
  loadSync() {
    return this.injector.loadSync(this.key, this.path, this.opts);
  }

  $get() {
    return this.load();
  }

  $getSync() {
    return this.loadSync();
  }
}
