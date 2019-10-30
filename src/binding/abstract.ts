/**
 * tiny-di
 * @module binding/abstract
 * @copyright Dennis Saenger <tiny-di-15@mail.ds82.de>
 */
'use strict';

import { AbstractBase } from '../base';

export class AbstractBinding extends AbstractBase {
  $get(env: any) {
    throw new Error('should be overriden by child class');
  }
}
