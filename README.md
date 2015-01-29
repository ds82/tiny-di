# tiny-di

A tini tiny dependency injection container for node.js/io.js

# example

```javascript
// main.js
var tiny = require('tiny-di');

// `require` the module now and bind it to `app`
tiny.bind('app').load('lib/app');

var something = require('something');
something.setup();

// bind an existing object to `something`
tiny.bind('something').to(something);

// layz bind
// this module is loaded as soon as somebody requests the binding `another`
tiny.bind('another').lazy('v1/another');

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

# unit tests

There are some basic unit tests (more to come)

```javascript
npm install
npm test
```

# why do you need a di container for node.js/io.js?

Why the hell not?


