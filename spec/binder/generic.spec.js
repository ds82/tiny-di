'use strict';

var proxy    = require('proxyquire').noCallThru().noPreserveCache();

var lazyStub = {};
lazyStub.LazyBinding = jasmine.createSpy('Lazy');

var UUT      = proxy('../../dist/binder/generic', {
  '../binding/lazy': lazyStub
}).GenericBinder;

proxy.callThru();

describe('binder/generic', function() {
  var uut;
  var injectorSpy, key;

  beforeEach(function() {
    lazyStub.LazyBinding.calls.reset();
    injectorSpy = jasmine.createSpyObj('injector', ['set']);
    key = 'some';

    uut = new UUT(injectorSpy, key);
  });

  describe('to()', function() {

    it('should set object on injector with given key', function() {
      var stub = jasmine.createSpy('stub');

      uut.to(stub);

      expect(injectorSpy.set).toHaveBeenCalledWith(key, stub);
    });

    it('should return the injector', function() {
      var result = uut.to({});
      expect(result).toEqual(injectorSpy);
    });

  });

  describe('lazy()', function() {

    it('should init a lazyBinding with injector, key and path', function() {
      var path = '/blubb/blah';

      uut.lazy(path);

      expect(lazyStub.LazyBinding).toHaveBeenCalledWith(injectorSpy, key, path);
    });

    it('should call set() on injector with key and LazyBinding', function() {
      uut.lazy('');
      expect(injectorSpy.set).toHaveBeenCalledWith(key, jasmine.any(lazyStub.LazyBinding));
    });

    it('should return the injector', function() {
      var result = uut.lazy('');
      expect(result).toEqual(injectorSpy);
    });

  });

});
