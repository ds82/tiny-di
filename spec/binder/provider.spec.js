'use strict';

var proxy = require('proxyquire').noCallThru().noPreserveCache();

var providerStub = {};
providerStub.ProviderBinding = jasmine.createSpy('ProviderBinding');

var mod = proxy('../../dist/binder/provider', {
  '../binding/provider': providerStub
});

proxy.callThru();

describe('binder/provider', function() {

  var uut;
  var injectorStub, key;

  beforeEach(function() {
    injectorStub = jasmine.createSpyObj('injector', [
      'set'
    ]);
    key = 'some';

    uut = new mod.ProviderBinder(injectorStub, key);
  });

  describe('by()', function() {

    it('should construct ProviderBinding', function() {
      var spy = jasmine.createSpy('providerFn');

      uut.by(spy);
      expect(providerStub.ProviderBinding).toHaveBeenCalledWith(injectorStub, key, spy);
    });

    it('should set binding in injector', function() {
      var spy = jasmine.createSpy('providerFn');
      uut.by(spy);

      expect(injectorStub.set).toHaveBeenCalledWith(key, jasmine.any(providerStub.ProviderBinding));
    });

    it('should return injector', function() {
      var result = uut.by(function() {});
      expect(result).toEqual(injectorStub);
    });

  });

});
