declare module "tiny-di" {
  export = TinyDiInjector;
}

declare class TinyDiInjector {
  bind(name: string): {
    to(module: any): TinyDiInjector,
    load(module: any): TinyDiInjector,
    lazy(module: any): TinyDiInjector
  };
  
  ns(namespace: string): {
    to(newNamespace: string): TinyDiInjector
  }
  
  get(module: string): any
  
  setResolver(resolver: Function): void;
  
  provide(provider: string): {
    by(somethingProvider: any): TinyDiInjector
  }
  
  setLogger(logger: any): void;
  
  set(key: string, object: any): any;
  
  //Helper
  /*getDefaultResolver(req: any): any;
  resolveKey(key: string): string;
  hasBindings(key): boolean;
  setNsBinding(ns: string, dir:string): void;
  load(key: string, what: any): any;
  lazy(key: string): any;
  ...
  */
}