'use strict';

const { AbstractBase } = require('../base');

describe('base.es6', function() {
  it('should take injector & key via constructor', function() {
    var injector = jest.fn();
    var key = jest.fn();

    var uut = new AbstractBase(injector, key);

    expect(uut.injector).toEqual(injector);
    expect(uut.key).toEqual(key);
  });
});
