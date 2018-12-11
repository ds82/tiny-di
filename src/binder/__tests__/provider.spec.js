var providerStub = {};
providerStub.ProviderBinding = jest.fn();

jest.doMock('../../binding/provider', () => providerStub);
const { ProviderBinder } = require('../../binder/provider');

describe('binder/provider', function() {
  var uut;
  var injectorStub, key;

  beforeEach(function() {
    injectorStub = {
      set: jest.fn()
    };
    key = 'some';

    jest.resetAllMocks();
    uut = new ProviderBinder(injectorStub, key);
  });

  describe('by()', function() {
    it('should construct ProviderBinding', function() {
      var spy = jest.fn();

      uut.by(spy);
      expect(providerStub.ProviderBinding).toHaveBeenCalledWith(
        injectorStub,
        key,
        spy
      );
    });

    it('should set binding in injector', function() {
      var spy = jasmine.createSpy('providerFn');
      uut.by(spy);

      expect(injectorStub.set).toHaveBeenCalledWith(
        key,
        jasmine.any(providerStub.ProviderBinding)
      );
    });

    it('should return injector', function() {
      var result = uut.by(function() {});
      expect(result).toEqual(injectorStub);
    });
  });
});
