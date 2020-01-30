import { mkBindingMap } from '../utils';

describe.only('utils', () => {
  describe('mkBindingMap', () => {
    it('should return a new empty Map when called without args', () => {
      const m = mkBindingMap();

      expect(m).toBeInstanceOf(Map);
      expect(m.size).toEqual(0);
    });

    it('should copy all entries of a given map', () => {
      const m1 = new Map();
      m1.set('foo', 'bar');

      const m2 = mkBindingMap([m1]);

      expect(m2.get('foo')).toEqual('bar');
    });

    it('should copy all entries of n given maps', () => {
      const m1 = new Map();
      m1.set('foo', 'bar');

      const m2 = new Map();
      m2.set('test', 1);

      const mResult = mkBindingMap([m1, m2]);

      expect(mResult.get('foo')).toEqual('bar');
      expect(mResult.get('test')).toEqual(1);
    });
  });
});
