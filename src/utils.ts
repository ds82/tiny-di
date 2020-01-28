export const isFunction = x => x && typeof x === 'function';

export const reduce = reducer => start => list => list.reduce(reducer, start);

export const map = fn => list => list.map(fn);

export const pipeM = (...[fst, ...pipeline]) => (...args) =>
  reduce((acc, fn) => (isPromise(acc) ? acc.then(fn) : fn(acc)))(
    resolve(fst(...args))
  )(pipeline);

export const partition = fn => list => [
  list.filter(fn),
  list.filter(x => !fn(x))
];

export const isPromise = maybePromise =>
  maybePromise &&
  isFunction(maybePromise.then) &&
  isFunction(maybePromise.catch);

export const head = list => (Array.isArray(list) ? list[0] : list);

const find = (predicate, list) => list.find(predicate);

export const resolve = x => (isPromise(x) ? Promise.resolve(x) : x);
export const resolveAll = x => (find(isPromise, x) ? Promise.all(x) : x);
