'use strict';

var UUT = require('../dist/base').AbstractBase;

describe('base.es6', function() {

  it('should take injector & key via constructor', function() {
    var injector = jasmine.createSpy('injector');
    var key = jasmine.createSpy(key);

    var uut = new UUT(injector, key);

    expect(uut.injector).toEqual(injector);
    expect(uut.key).toEqual(key);
  });

});
