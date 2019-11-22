# tiny-di [![Build Status](https://secure.travis-ci.org/ds82/tiny-di.svg)](http://travis-ci.org/ds82/tiny-di) [![Coverage Status](https://coveralls.io/repos/ds82/tiny-di/badge.svg?branch=master)](https://coveralls.io/r/ds82/tiny-di?branch=master)

[![npm](https://nodei.co/npm/tiny-di.png?downloads=true&stars=true)](https://nodei.co/npm/tiny-di/)

A tini tiny dependency injection container for node.js/io.js

# example

```javascript
// main.js
const tiny = require('tiny-di')();

// `require` the module now and bind it to `app`
tiny.bind('app').load('lib/app');

const something = require('something');
something.setup();

// bind an existing object to `something`
tiny.bind('something').to(something);

// layz bind
// this module is loaded as soon as somebody requests the binding `another`
tiny.bind('another').lazy('v1/another');

// use namespaces
tiny.ns('some/ns').to('./some/local/dir/');

 // returns a promise with content of require('./some/local/dir/foo')
 tiny.get('some/ns/foo');

 // returns contents of require('./some/local/dir/foo')
 // CARE: throws exception if some/ns/foo or a dependency requires a resolved injection
 tiny.getSync('some/ns/foo');


// use custom providers
tiny.provide('Something').by(somethingProvider);

// this function is called whenever a module requires `Somehing`
function somethingProvider(env, injector) {
  return 'I was required by ' + env.binding;
}

// tiny-di comes with built-in resolver which tries
// to cover basic use cases.
// if you need a more advanced resolving of your deps, you can
// set a custom resolver
// have a look at the built-in resolver before doing this!
tiny.setResolver(function(file) {
  return require(file);
});


...
```

```javascript
// module
module.exports = Module;

Module.$inject = ['app', 'something', 'another'];
function Module(app, something, another) {

  // use the constructor pattern for your modules/libs/classes..
  if (!(this instanceof Module)) {
    return new Module(app, something, another);
  }

  var self = this;

  // app, something and another are injected :)
  ...
}

```

## Advanced Injector configuration

```javascript
// module
module.exports = Module;

Module.$inject = ['app', 'something', 'another'];
Module.$type = 'class';
function Module(app, something, another) {
  // callAs='class' tells the injector to instantiate a new class
  // now you don't need to use the constructor pattern. yah!

  var self = this;

  // (this instanceof Module) -> true!
}
```

### Support async dependencies

```ts
Something.$inject = [['one', { resolve: true }], 'two', 'three'];
Something.$type = 'function'; // 'class'
function Something(one, two, three) {
  // the 'one' dependency is resolved before passed to Something
  console.log(one);
}
```

# examples

look at the `example`-folder for a simple howto

# develop

```javascript
npm install
npm run watch

```

# tests

Test coverage is quite good at the moment (see badge above).

```javascript
npm install
npm test
```

# license

MIT
