export const isFunction = x => x && typeof x === 'function';

export const reduce = reducer => start => list => list.reduce(reducer, start);

export const map = fn => list => list.map(fn);

export const pipeM = (...[fst, ...pipeline]) => (...args) =>
  reduce((acc, fn) => acc.then(fn))(Promise.resolve(fst(...args)))(pipeline);

export const partition = fn => list => [
  list.filter(fn),
  list.filter(x => !fn(x))
];

export const isPromise = maybePromise =>
  maybePromise &&
  isFunction(maybePromise.then) &&
  isFunction(maybePromise.catch);

export const head = list => (Array.isArray(list) ? list[0] : list);

export const resolve = x => Promise.resolve(x);
export const resolveAll = x => Promise.all(x);
