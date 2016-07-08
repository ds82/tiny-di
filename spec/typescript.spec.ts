///<reference path="../tiny-di.d.ts" />
import TinyDiInjectableBase from '../dist/injectable';

describe('typescript class', () => {
  it('can define $inject property', () => {
    class MyClass extends TinyDiInjectableBase {}
    MyClass.$inject = ['dependency'];
    expect(MyClass.$inject).toBeDefined();
  });

  it('can be loaded by tiny-di', () => {
    let tiny = require('../dist');
    let injector: TinyDiInjector  = new tiny();
    injector.setResolver(resolver);
    injector.bind('dependency').to('exampleDep');
    injector.bind('myClassInstance').load(__dirname + '/exampleclass.js');

    let instance = injector.get('myClassInstance');
    expect(instance.dep).toEqual('exampleDep');
  });
});

/**
 * define resolver to load default exported classes
 */
function resolver(module: string) {
  return require(module).default;
}
