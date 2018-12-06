'use strict';

const { ProviderBinding } = require('../../binding/provider');

describe('binding/provider', function() {
  var uut;
  var injectorStub, providerFnStub, key;

  beforeEach(function() {
    injectorStub = {
      set: jest.fn()
    };
    providerFnStub = jest.fn();
    key = 'some';

    uut = new ProviderBinding(injectorStub, key, providerFnStub);
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
