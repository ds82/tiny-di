export default class TinyDiInjectableBase {
  public static $inject: string[] | {
    deps: string[],
    callAs: 'class' | 'function'
  };
}
