/**
 * tiny-di
 * @module binding/provider
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import {AbstractBinding} from './abstract';

export class ProviderBinding extends AbstractBinding {
  constructor(injector, key, fn) {
    super(injector, key);
    this.fn = fn;
  }

  $get(requestedBy) {
    return this.fn(requestedBy, this.injector, this.key);
  }
}

