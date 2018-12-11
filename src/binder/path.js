/**
 * tiny-di
 * @module binder/path
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import { AbstractBase } from '../base';

export class PathBinder extends AbstractBase {
  to(dir) {
    // console.log('new pathBinding', this.key, dir);
    this.injector.setNsBinding(this.key, dir);
  }
}
