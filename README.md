# tiny-di [![Build Status](https://secure.travis-ci.org/ds82/tiny-di.svg)](http://travis-ci.org/ds82/tiny-di) [![Coverage Status](https://coveralls.io/repos/ds82/tiny-di/badge.svg?branch=master)](https://coveralls.io/r/ds82/tiny-di?branch=master)

[![npm](https://nodei.co/npm/tiny-di.png?downloads=true&stars=true)](https://nodei.co/npm/tiny-di/)

A tini tiny dependency injection container for node.js/io.js

# example

```javascript
// main.js
var tiny = require('tiny-di')();

// you should always set a basic resolver
// without this, require calls are relative to the
// location of the tiny-di module (somewhere in node_modules)
tiny.setResolver(function(file) {
  return require(file);
});

// `require` the module now and bind it to `app`
tiny.bind('app').load('lib/app');

var something = require('something');
something.setup();

// bind an existing object to `something`
tiny.bind('something').to(something);

// layz bind
// this module is loaded as soon as somebody requests the binding `another`
tiny.bind('another').lazy('v1/another');

// use namespaces
tiny.ns('some/ns').to('./some/local/dir/');
tiny.get('some/ns/foo'); // will require('./some/local/dir/foo')

...
```

```javascript
// module
module.exports Module;


Module.$inject = ['app', 'something', 'another'];
function Module(app, something, another) {
  // app, something and another are injected :)
  ...
}

```

# tests

There are some basic unit tests (more to come)

```javascript
npm install
npm test
```

# license

MIT



