'use strict';

var tinyDi = require('../dist/');

module.exports = 'tiny-di.spec';

describe('tiny-di', function() {

  var tiny;
  var fakeLoader;

  var FAKE_MAP = {
    'Fake': Fake,
    'FakeWithDep': FakeWithDep,
    'Dep1': Dep1,
    'Dep2': Dep2,
    'Dep3': Dep3,
    'other': other()
  };

  beforeEach(function() {
    fakeLoader = jasmine.createSpy('fakeLoader');

    tiny = tinyDi();
    tiny.setResolver(fakeLoader);
  });

  it('should resolve relative to main module', function() {
    tiny = tinyDi();
    tiny.setResolver(function(file) {
      return require(file);
    });
    var pack = tiny.get('./index.spec.js');
    expect(pack).toEqual(module.exports);
  });

  it('bind->load should return module', function() {
    fakeLoader.andReturn(Fake);
    var test = tiny.bind('test').load('fake');
    expect(test).toEqual(Fake);
  });

  it('bind->to, get should return to object', function() {
    tiny.bind('some').to(Fake);
    expect(tiny.get('some')).toEqual(Fake);
  });

  it('bind->lazy, get should lazy load object', function() {
    var called = false;
    var stub = function() {
      called = true;
      return stub;
    };
    stub.$inject = [];

    tiny.setResolver(function() { return stub; });
    tiny.bind('stub').lazy('stub.test');

    expect(called).toEqual(false);
    expect(tiny.get('stub.test')).toEqual(stub);
    expect(called).toEqual(true);
  });

  it('bind->load, should be bound to bind key', function() {
    fakeLoader.andReturn(Fake);

    tiny.bind('test').load('some');

    expect(tiny.hasBinding('test')).toBe(true);
    expect(tiny.get('test')).toEqual(Fake);
    expect(fakeLoader.calls.length).toBe(1);
  });

  it('bind->load should never require a file twice', function() {
    fakeLoader.andReturn(Fake);

    var test = tiny.bind('test').load('fake');

    var t1 = tiny.get('test');
    var t2 = tiny.get('test');

    expect(test).toEqual(Fake);
    expect(t1).toEqual(Fake);
    expect(t2).toEqual(Fake);
    expect(fakeLoader.calls.length).toBe(1);
  });

  it('auto-loaded deps should not be loaded more than once', function() {
    fakeLoader.andCallFake(resolveByFakeMap);

    var fake = tiny.get('Fake');
    var fakeWithDep = tiny.get('FakeWithDep');

    expect(fake).toEqual(Fake);
    expect(fakeWithDep).toEqual(Fake);

    // 1 for Fake, 1 for FakeWithDep
    expect(fakeLoader.calls.length).toEqual(2);
  });


  it('should recognize circular deps', function() {
    fakeLoader.andCallFake(resolveByFakeMap);

    var fn = function() { tiny.get('Dep1'); };
    expect(fn).toThrow(new Error('Circular dependency found; abort loading'));
  });

  it('should always return module.exports value of required file', function() {
    fakeLoader.andCallFake(resolveByFakeMap);
    var blob = tiny.get('other');
    expect(blob).toEqual(other());
  });

  describe('lazy', function() {
  
    it('should lazy load modules', function() {
      fakeLoader.andCallFake(resolveByFakeMap);

      tiny.bind('some').lazy('Fake');
      var fake = tiny.get('some');

      expect(fake).toEqual(Fake);
    });
  
  
  });

  describe('ns', function() {

    it('should consider namespaces', function() {
      fakeLoader.andCallFake(resolveByFakeMap);

      var dir = './test/blubb/blah';
      tiny.ns('test').to(dir);

      tiny.get('test/some');
      expect(fakeLoader).toHaveBeenCalledWith(dir + '/some');
    });

  });


  function resolveByFakeMap(what) {
    return FAKE_MAP[what];
  }

  Fake.$inject = [];
  function Fake() {
    return Fake;
  }

  FakeWithDep.$inject = ['Fake'];
  function FakeWithDep(Fake) {
    return Fake;
  }

  Dep1.$inject = ['Dep2'];
  function Dep1(dep2) {}

  Dep2.$inject = ['Dep3'];
  function Dep2(dep3) {}

  Dep3.$inject = ['Dep1'];
  function Dep3(dep1) {}

  function other() {
    return { other: true };
  }

});


