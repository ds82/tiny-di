import tinyDi, { TFunctionWithDependency } from '../index';
import { Module } from 'module';

type TFAKE_MAP = {
  [key: string]: any;
};

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
  let tiny;
  let fakeLoader;
  let Spy;

  const FAKE_MAP: TFAKE_MAP = {
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
    expect(tiny.constructor.name).toEqual('Injector');
  });

  it('should export a version prop', () => {
    const tiny = tinyDi();
    const version = require('../../package.json').version;
    expect(tiny.version).toEqual(version);
  });

  it('should resolve relative to main module', function() {
    tiny = tinyDi();
    tiny.setResolver(function(file) {
      return require(file);
    });
    var pack = tiny.getSync('./index.spec');
    expect(pack).toEqual(module.exports);
  });

  it('bind->load should return module', function() {
    fakeLoader.and.returnValue(Fake);
    var test = tiny.bind('test').loadSync('fake');
    expect(test).toEqual(Fake);
  });

  it('bind->to, get should return to object', function() {
    tiny.bindSync('some').to(Fake);
    expect(tiny.getSync('some')).toEqual(Fake);
  });

  it('bind->lazy, get should lazy load object', function() {
    var called = false;
    const stub = () => {
      called = true;
      return stub;
    };
    (stub as any).$inject = [];

    tiny.setResolver(function() {
      return stub;
    });
    tiny.bind('stub').lazy('stub.test');

    expect(called).toEqual(false);
    expect(tiny.getSync('stub.test')).toEqual(stub);
    expect(called).toEqual(true);
  });

  it('bind->load, should be bound to bind key', function() {
    fakeLoader.and.returnValue(Fake);

    tiny.bind('test').loadSync('some');

    expect(tiny.hasBinding('test')).toBe(true);
    expect(tiny.getSync('test')).toEqual(Fake);
    expect(fakeLoader.calls.count()).toBe(1);
  });

  it('bind->load should never require a file more than once', function() {
    fakeLoader.and.returnValue(Fake);

    var test = tiny.bind('test').loadSync('fake');

    var t1 = tiny.getSync('test');
    var t2 = tiny.getSync('test');

    expect(test).toEqual(Fake);
    expect(t1).toEqual(Fake);
    expect(t2).toEqual(Fake);
    expect(fakeLoader.calls.count()).toBe(1);
  });

  it('auto-loaded deps should not be loaded more than once', function() {
    var fake = tiny.getSync('Fake');
    var fakeWithDep = tiny.getSync('FakeWithDep');

    expect(fake).toEqual(Fake);
    expect(fakeWithDep).toEqual(Fake);

    // 1 for Fake, 1 for FakeWithDep
    expect(fakeLoader.calls.count()).toEqual(2);
  });

  it('should recognize circular deps using get()', function() {
    var fn = function() {
      tiny.getSync('Dep1');
    };
    expect(fn).toThrow(new Error('Circular dependency found; abort loading'));
  });

  it('should recognize circular deps using load()', function() {
    var fn = function() {
      tiny.loadSync('Dep1');
    };
    expect(fn).toThrow(new Error('Circular dependency found; abort loading'));
  });

  it('should always return module.exports value of required file', function() {
    var blob = tiny.getSync('other');
    expect(blob).toEqual(other());
  });

  it('should load deps from subdirs', function() {
    fakeLoader.and.returnValue(1);
    tiny.bind('fileAPI').loadSync('extensions/fileAPI');
    var blob = tiny.getSync('fileAPI');

    expect(fakeLoader).toHaveBeenCalledWith('extensions/fileAPI');
  });

  it('should load deps from $inject-array', function() {
    Spy.$inject = ['Const1', 'Const2'];
    var spy = tiny.getSync('Spy');

    var any = jasmine.any;
    expect(Spy).toHaveBeenCalledWith('Const1', 'Const2');
  });

  it('should instantiate fn as function if $type = function', function() {
    (ClassFake as any).$type = 'function';

    var calledAsClass = tiny.getSync('ClassFake');
    expect(calledAsClass).toEqual(false);
  });

  it('should instantiate fn as class if $type = class', function() {
    (ClassFake as any).$type = 'class';

    var clazz = tiny.getSync('ClassFake');
    expect(clazz instanceof ClassFake).toEqual(true);
  });

  describe('chaining', () => {
    it('should be possible to chain bind, to, bind, to', () => {
      const tiny = tinyDi();
      tiny
        .bind('v1')
        .to(10)
        .bind('v2')
        .to(20);

      expect(tiny.getSync('v1')).toEqual(10);
      expect(tiny.getSync('v2')).toEqual(20);
    });

    it('should be possible to chain bind, to, bind, load', () => {
      const tiny = tinyDi();

      const localFake = f => f + 1;
      localFake.$inject = [];

      tiny
        .bind('v1')
        .to(10)
        .bind('localFake')
        .load(localFake);
    });
  });

  describe('loadSync', () => {
    it('should allow to overwrite bindings passed via opts', () => {
      Spy.$inject = ['Const1', 'Const2'];

      tiny.loadSync('Spy', 'Spy', { bindings: { Const2: 'OVERWRITE' } });

      expect(Spy).toHaveBeenCalledWith('Const1', 'OVERWRITE');
    });

    it('it should allow to load a passend function', () => {
      const foo = c => [1, c];
      foo.$inject = ['Const1'];

      const t = tiny.loadSync(foo);
      expect(t).toEqual([1, 'Const1']);
    });
  });

  describe('bind', () => {
    describe('to', () => {
      it('should bind->to a function', () => {
        const someFn = val => val + 100;
        someFn.$inject = ['value'];

        const tiny = tinyDi();
        tiny.bindSync('value').to(10);

        tiny.bindSync('test').to(someFn);

        const result = tiny.getSync('test');
        expect(result).toEqual(110);
      });

      it('should bind->to a function with custom binding overload', () => {
        const someFn = val => val + 100;
        someFn.$inject = ['value'];

        const tiny = tinyDi();
        tiny.bindSync('value').to(10);

        tiny.bindSync('test').to(someFn, { bindings: { value: 20 } });

        const result = tiny.getSync('test');
        expect(result).toEqual(120);
      });
    });

    describe('lazy', () => {
      it('should bind->lazy to a function', () => {
        const someFn = jest.fn(val => val + 100);
        (someFn as any).$inject = ['value'];

        const tiny = tinyDi();
        tiny.bind('value').to(10);

        tiny.bind('test').lazy(someFn);

        expect(someFn).not.toHaveBeenCalled();

        const result = tiny.getSync('test');
        expect(result).toEqual(110);
      });

      it('should bind->lazy a function with custom binding overload', () => {
        const someFn = val => val + 100;
        someFn.$inject = ['value'];

        const tiny = tinyDi();
        tiny.bind('value').to(10);

        tiny.bind('test').lazy(someFn, { bindings: { value: 20 } });

        const result = tiny.getSync('test');
        expect(result).toEqual(120);
      });
    });
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

      var fake = tiny.getSync('some');

      expect(fakeLoader).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
      expect(fake).toEqual(111);
    });

    it('should allow to overwrite bindings passed via opts', () => {
      Spy.$inject = ['Const1', 'Const2'];

      tiny.lazy('Spy', { bindings: { Const2: 'OVERWRITE' } });

      expect(Spy).toHaveBeenCalledWith('Const1', 'OVERWRITE');
    });
  });

  describe('ns', function() {
    it('should consider generic namespaces', function() {
      fakeLoader.and.callFake(resolveByFakeMap);

      tiny.ns('test').to('some');
      var other = tiny.getSync('test/other');

      expect(fakeLoader).toHaveBeenCalledWith('some/other');
      expect(other).toEqual(FAKE_MAP['some/other']);
    });

    it('should work with root of ns', function() {
      tiny.ns('test').to('some');
      var dep1 = tiny.getSync('test');

      expect(dep1).toEqual(FAKE_MAP.some);
      expect(fakeLoader).toHaveBeenCalledWith('some');
    });

    it('should work with $inject', function() {
      tiny.ns('test').to('some');

      var fake = tiny.getSync('test/foo');

      expect(fake).toEqual(Fake);
    });

    it('should consider (dir-)namespaces', function() {
      fakeLoader.and.callFake(resolveByFakeMap);

      var dir = './test/blubb/blah';
      tiny.ns('test').to(dir);

      tiny.getSync('test/some');
      expect(fakeLoader).toHaveBeenCalledWith(dir + '/some');
    });

    it('should work with deep module', function() {
      tiny.ns('test').to('some');

      var bar = tiny.getSync('test/foo/bar');

      expect(bar).toEqual(FAKE_MAP['some/foo/bar']);
      expect(fakeLoader).toHaveBeenCalledWith('some/foo/bar');
    });

    it('should work with other extensions', () => {
      tiny.ns('assets').to('/root/assets');
      tiny.getSync('assets/foo/some.json');

      expect(fakeLoader).toHaveBeenCalledWith('/root/assets/foo/some.json');
    });

    it('should work with similiar ns ids', () => {
      tiny.ns('config').to('/root/config');
      tiny.ns('conf').to('/root/conf');

      tiny.getSync('config/foo');
      expect(fakeLoader).toHaveBeenCalledWith('/root/config/foo');

      tiny.getSync('conf/bar');
      expect(fakeLoader).toHaveBeenCalledWith('/root/conf/bar');
    });
  });

  describe('provide-by', function() {
    it('should return returnValue of providerFn', function() {
      var spy = jasmine.createSpy('provider');
      var someEnv = { foo: 1, bar: 2 };

      tiny.provide('byProvider').by(spy);

      tiny.getSync('byProvider', someEnv);

      expect(spy).toHaveBeenCalledWith(someEnv, tiny, 'byProvider');
    });

    it('should tell deps who required them', function() {
      var spy = jasmine.createSpy('Fake');
      tiny.provide('Fake').by(spy);

      tiny.getSync('FakeWithDep');

      var expectedEnv = {
        key: 'FakeWithDep',
        binding: 'FakeWithDep'
      };
      expect(spy).toHaveBeenCalledWith(expectedEnv, tiny, 'Fake');
    });
  });

  describe('getSync', function() {
    it('should return single instance if called with string-parameter', function() {
      var test = tiny.getSync('Fake');
      expect(test).toEqual(Fake);
    });

    it('should return list of instances if called with list of strings', function() {
      var list = tiny.getSync(['Fake', 'AnotherFake']);

      expect(list[0]).toEqual(Fake);
      expect(list[1]).toEqual(AnotherFake);
    });
  });

  describe('es6', function() {
    it('should work with es6 default export', function() {
      var result = tiny.getSync('ES6DefaultExport');
      expect(result).toEqual(Fake);
    });
  });

  describe('get', () => {
    it('should get module by returning a promise', async () => {
      const Foobar1: any = () => 1;
      Foobar1.$inject = [];

      tiny.bind('test').lazy(Foobar1);
      const result = await tiny.get('test');

      expect(result).toEqual(1);
    });

    it('should load a module with an async dependency', async () => {
      const fakePromise = () => Promise.resolve(1);
      fakePromise.$inject = [];

      const localFake = f => f + 1;
      localFake.$inject = [['fakePromise', { resolve: true }]];

      tiny.bind('fakePromise').to(fakePromise);
      const result = await tiny.load(localFake);

      expect(result).toEqual(2);
    });

    it('should load a module with an async and a sync dependency', async () => {
      const fakePromise = () => Promise.resolve(1);
      fakePromise.$inject = [];

      const fakeSync = () => 3;
      fakeSync.$inject = [];

      const localFake = (a, b) => {
        return a + b;
      };
      localFake.$inject = [['fakePromise', { resolve: true }], 'fakeSync'];

      tiny.bind('fakePromise').to(fakePromise);
      tiny.bind('fakeSync').to(fakeSync);
      const result = await tiny.load(localFake);

      expect(result).toEqual(4);
    });

    it('should load a module with an async/resolved dependency and one returning a promise', async () => {
      const d1 = () => Promise.resolve(1);
      d1.$inject = [];
      const d2 = () => Promise.resolve(2);
      d2.$inject = [];

      const localFake = (d1, d2) => d2.then(r => r + d1);
      localFake.$inject = ['d1', ['d2', { resolve: false }]];

      tiny.bind('d1').to(d1);
      tiny.bind('d2').to(d2);

      const result = await tiny.load(localFake);
      expect(result).toEqual(3);
    });

    it('should load a module with transitive async dependencies', async () => {
      const ModuleA = (b, c) => b + c;
      ModuleA.$inject = ['ModuleB', 'ModuleC'];

      const ModuleB = c => {
        return c + 2;
      };
      ModuleB.$inject = ['ModuleC'];

      const ModuleC = () => Promise.resolve(3);
      ModuleC.$inject = [];

      tiny.bind('ModuleC').to(ModuleC);
      tiny.bind('ModuleB').to(ModuleB);

      const result = await tiny.load(ModuleA);

      expect(result).toEqual(8);
    });

    it('should work if one module wants the unresolved promise and one wants the resolved promise', async () => {
      const main = (a, b, c) => a * b + c;
      main.$inject = ['a', 'b', 'c'];

      const a = b => b.then(_b => 10 + _b);
      a.$inject = [['b', { resolve: false }]];

      const b = () => Promise.resolve(20);
      b.$inject = [];

      const c = () => 50;
      c.$inject = [];

      tiny.bind('c').to(c);
      tiny.bind('b').to(b);
      tiny.bind('a').to(a);

      const result = await tiny.load(main);

      expect(result).toEqual(650);
    });

    it('should work lazy', async () => {
      const main = (a, b) => {
        return a * b;
      };
      main.$inject = ['a', 'b'];

      const a = b => {
        return 10 + b;
      };
      a.$inject = ['b'];

      const b = () => Promise.resolve(20);
      b.$inject = [];

      tiny.bind('a').lazy(a);
      tiny.bind('b').lazy(b);

      const result = await tiny.load(main);

      expect(result).toEqual(600);
    });
  });

  function resolveByFakeMap(what) {
    return FAKE_MAP[what];
  }
});
