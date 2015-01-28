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
tiny.bind('antoher').lazy('v1/antoher');

...
```

```javascript
// module
module.exports Module;


Module.$inject = ['app', 'something', 'antoher'];
function Module(app, something, another) {
  // app, something and another are injected :)
  ...
}

```

# why do you need a di container for node.js/io.js?

Why the hell not?


