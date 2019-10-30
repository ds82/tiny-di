/**
 * tiny-di
 * @module base
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */

export class AbstractBase {
  injector: any;
  key: any;

  constructor(_injector, _key) {
    this.injector = _injector;
    this.key = _key;
  }
}
