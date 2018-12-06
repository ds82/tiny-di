const tinyDi = require('../');

module.exports = 'tiny-di.spec';

Fake.$inject = [];
function Fake() {
  return Fake;
}

AnotherFake.$inject = [];
function AnotherFake() {
  return AnotherFake;
}

ClassFake.$inject = {};
function ClassFake() {
  if (!(this instanceof ClassFake)) {
    return false;
  }
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

NeedsTestNS.$inject = ['test/other'];
function NeedsTestNS(other) {
  return other;
}

var ES6DefaultExport = {
  default: Fake
};

describe('tiny-di', function() {
  var tiny;
  var fakeLoader;
  var Spy;

  var FAKE_MAP = {
    Fake: Fake,
    AnotherFake: AnotherFake,
    FakeWithDep: FakeWithDep,
    Dep1: Dep1,
    Dep2: Dep2,
    Dep3: Dep3,
    ClassFake: ClassFake,
    Const1: 'Const1',
    Const2: 'Const2',
    other: other(),
    some: Fake,
    'some/other': Fake,
    'some/foo': NeedsTestNS,
    'some/deep/fake': Fake,
    ES6DefaultExport: ES6DefaultExport
  };

  beforeEach(function() {
    fakeLoader = jasmine.createSpy('fakeLoader');
    fakeLoader.and.callFake(resolveByFakeMap);

    Spy = jasmine.createSpy('Spy');
    FAKE_MAP.Spy = Spy;

    tiny = tinyDi();
    tiny.setResolver(fakeLoader);
  });

  it('should create an instance if TinyDi when called as function', function() {
    var tiny = tinyDi();
    expect(tiny.constructor.name).toEqual('TinyDi');
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
    fakeLoader.and.returnValue(Fake);
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

    tiny.setResolver(function() {
      return stub;
    });
    tiny.bind('stub').lazy('stub.test');

    expect(called).toEqual(false);
    expect(tiny.get('stub.test')).toEqual(stub);
    expect(called).toEqual(true);
  });

  it('bind->load, should be bound to bind key', function() {
    fakeLoader.and.returnValue(Fake);

    tiny.bind('test').load('some');

    expect(tiny.hasBinding('test')).toBe(true);
    expect(tiny.get('test')).toEqual(Fake);
    expect(fakeLoader.calls.count()).toBe(1);
  });

  it('bind->load should never require a file more than once', function() {
    fakeLoader.and.returnValue(Fake);

    var test = tiny.bind('test').load('fake');

    var t1 = tiny.get('test');
    var t2 = tiny.get('test');

    expect(test).toEqual(Fake);
    expect(t1).toEqual(Fake);
    expect(t2).toEqual(Fake);
    expect(fakeLoader.calls.count()).toBe(1);
  });

  it('auto-loaded deps should not be loaded more than once', function() {
    var fake = tiny.get('Fake');
    var fakeWithDep = tiny.get('FakeWithDep');

    expect(fake).toEqual(Fake);
    expect(fakeWithDep).toEqual(Fake);

    // 1 for Fake, 1 for FakeWithDep
    expect(fakeLoader.calls.count()).toEqual(2);
  });

  it('should recognize circular deps using get()', function() {
    var fn = function() {
      tiny.get('Dep1');
    };
    expect(fn).toThrow(new Error('Circular dependency found; abort loading'));
  });

  it('should recognize circular deps using load()', function() {
    var fn = function() {
      tiny.load('Dep1');
    };
    expect(fn).toThrow(new Error('Circular dependency found; abort loading'));
  });

  it('should always return module.exports value of required file', function() {
    var blob = tiny.get('other');
    expect(blob).toEqual(other());
  });

  it('should load deps from subdirs', function() {
    fakeLoader.and.returnValue(1);
    tiny.bind('fileAPI').load('extensions/fileAPI');
    var blob = tiny.get('fileAPI');

    expect(fakeLoader).toHaveBeenCalledWith('extensions/fileAPI');
  });

  it('should load deps from $inject-array', function() {
    Spy.$inject = ['Const1', 'Const2'];
    var spy = tiny.get('Spy');

    var any = jasmine.any;
    expect(Spy).toHaveBeenCalledWith('Const1', 'Const2');
  });

  it('should instantiate fn as function if callAs=function', function() {
    ClassFake.$inject = {
      callAs: 'function'
    };

    var calledAsClass = tiny.get('ClassFake');
    expect(calledAsClass).toEqual(false);
  });

  it('should instantiate fn as class if callAs=class', function() {
    ClassFake.$inject = {
      callAs: 'class'
    };

    var clazz = tiny.get('ClassFake');
    expect(clazz instanceof ClassFake).toEqual(true);
  });

  describe('lazy', function() {
    it('should lazy load modules', function() {
      var spy = jasmine.createSpy('lazySpy');

      Lazy.$inject = [];
      function Lazy() {
        spy();
        return 111;
      }

      fakeLoader.and.returnValue(Lazy);

      tiny.bind('some').lazy('Lazy');
      expect(spy).not.toHaveBeenCalled();

      var fake = tiny.get('some');

      expect(fakeLoader).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
      expect(fake).toEqual(111);
    });
  });

  describe('ns', function() {
    it('should consider generic namespaces', function() {
      fakeLoader.and.callFake(resolveByFakeMap);

      tiny.ns('test').to('some');
      var other = tiny.get('test/other');

      expect(fakeLoader).toHaveBeenCalledWith('some/other');
      expect(other).toEqual(FAKE_MAP['some/other']);
    });

    it('should work with root of ns', function() {
      tiny.ns('test').to('some');
      var dep1 = tiny.get('test');

      expect(dep1).toEqual(FAKE_MAP.some);
      expect(fakeLoader).toHaveBeenCalledWith('some');
    });

    // SHOULD WORK WITH DEEPER NS STRUCTURE

    it('should work with $inject', function() {
      tiny.ns('test').to('some');

      var fake = tiny.get('test/foo');

      expect(fake).toEqual(Fake);
    });

    it('should consider (dir-)namespaces', function() {
      fakeLoader.and.callFake(resolveByFakeMap);

      var dir = './test/blubb/blah';
      tiny.ns('test').to(dir);

      tiny.get('test/some');
      expect(fakeLoader).toHaveBeenCalledWith(dir + '/some');
    });

    it('should work with deep module', function() {
      tiny.ns('test').to('some');

      var bar = tiny.get('test/foo/bar');

      expect(bar).toEqual(FAKE_MAP['some/foo/bar']);
      expect(fakeLoader).toHaveBeenCalledWith('some/foo/bar');
    });
  });

  describe('provide-by', function() {
    it('should return returnValue of providerFn', function() {
      var spy = jasmine.createSpy('provider');
      var someEnv = { foo: 1, bar: 2 };

      tiny.provide('byProvider').by(spy);

      tiny.get('byProvider', someEnv);

      expect(spy).toHaveBeenCalledWith(someEnv, tiny, 'byProvider');
    });

    it('should tell deps who required them', function() {
      var spy = jasmine.createSpy('Fake');
      tiny.provide('Fake').by(spy);

      tiny.get('FakeWithDep');

      var expectedEnv = {
        key: 'FakeWithDep',
        binding: 'FakeWithDep'
      };
      expect(spy).toHaveBeenCalledWith(expectedEnv, tiny, 'Fake');
    });
  });

  describe('get', function() {
    it('should return single instance if called with string-parameter', function() {
      var test = tiny.get('Fake');
      expect(test).toEqual(Fake);
    });

    it('should return list of instances if called with list of strings', function() {
      var list = tiny.get(['Fake', 'AnotherFake']);

      expect(list[0]).toEqual(Fake);
      expect(list[1]).toEqual(AnotherFake);
    });
  });

  describe('es6', function() {
    it('should work with es6 default export', function() {
      var result = tiny.get('ES6DefaultExport');
      expect(result).toEqual(Fake);
    });
  });

  function resolveByFakeMap(what) {
    return FAKE_MAP[what];
  }
});
