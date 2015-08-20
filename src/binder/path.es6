/**
 * tiny-di
 * @module binder/path
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

var path = require('path');

import {AbstractBase} from '../base';

export class PathBinder extends AbstractBase {
  constructor(injector, key) {
    super(injector, key);
    this.basePath = path.dirname(require.main.filename);
  }

  to(dir) {
    dir = './' + path.relative(this.basePath, path.resolve(this.basePath, dir));
    this.injector.setNsBinding(this.key, dir);
  }
}
