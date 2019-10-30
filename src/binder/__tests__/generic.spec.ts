'use strict';

var lazyStub = {};
lazyStub.LazyBinding = jest.fn();

jest.doMock('../../binding/lazy', () => lazyStub);
const { GenericBinder } = require('../../binder/generic');

describe('binder/generic', function() {
  var uut;
  var injectorSpy, key;

  beforeEach(function() {
    // lazyStub.LazyBinding.calls.reset();
    jest.resetAllMocks();
    injectorSpy = {
      set: jest.fn()
    };
    key = 'some';

    uut = new GenericBinder(injectorSpy, key);
  });

  describe('to()', function() {
    it('should set object on injector with given key', function() {
      var stub = jest.fn();

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
      expect(injectorSpy.set).toHaveBeenCalledWith(
        key,
        jasmine.any(lazyStub.LazyBinding)
      );
    });

    it.only('should return the injector', function() {
      var result = uut.lazy('');
      expect(result).toEqual(injectorSpy);
    });
  });
});
