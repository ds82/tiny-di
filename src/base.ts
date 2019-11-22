/**
 * tiny-di
 * @module base
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */

export class AbstractBase {
  injector: any;
  key: any;
  opts: any;

  constructor(_injector, _key, _opts = {}) {
    this.injector = _injector;
    this.key = _key;
    this.opts = _opts;
  }
}
