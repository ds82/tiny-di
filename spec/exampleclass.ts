import TinyDiInjectableBase from '../dist/injectable';

export default class MyClass extends TinyDiInjectableBase {
  constructor(private dep: any) {
    super();
  }
}
MyClass.$inject = {
  deps: ['dependency'],
  callAs: 'class'
};
