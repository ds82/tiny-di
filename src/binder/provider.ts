/**
 * tiny-di
 * @module binder/provider
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import {AbstractBase} from '../base';
import {ProviderBinding} from '../binding/provider';

export class ProviderBinder extends AbstractBase {
  by(fn) {
    var binding = new ProviderBinding(this.injector, this.key, fn);
    this.injector.set(this.key, binding);
    return this.injector;
  }
}
