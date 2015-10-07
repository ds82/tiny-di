var UUT = require('../../dist/binding/provider').ProviderBinding;

describe('binding/provider', function() {

  var uut, injectorStub, providerFnStub, key;

  beforeEach(function() {
    injectorStub = jasmine.createSpyObj('injector', [
      'set'
    ]);
    providerFnStub = jasmine.createSpy('providerFn');
    key = 'some';

    uut = new UUT(injectorStub, key, providerFnStub);
  });

  it('should save the function as class variable', function() {
    expect(uut.fn).toEqual(providerFnStub);
  });

  describe('$get', function() {

    it('should call providerFn with correct paramters', function() {
      uut.$get('foo');
      expect(providerFnStub).toHaveBeenCalledWith('foo', injectorStub, key);
    });
  });

});

