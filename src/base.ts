/**
 * tiny-di
 * @module base
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

export class AbstractBase {
  constructor(injector, key) {
    this.injector = injector;
    this.key = key;
  }
}
