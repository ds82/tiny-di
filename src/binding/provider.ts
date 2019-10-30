/**
 * tiny-di
 * @module binding/provider
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import { AbstractBinding } from './abstract';

export class ProviderBinding extends AbstractBinding {
  fn: any;

  constructor(injector, key, _fn) {
    super(injector, key);
    this.fn = _fn;
  }

  $get(requestedBy) {
    return this.fn(requestedBy, this.injector, this.key);
  }
}
