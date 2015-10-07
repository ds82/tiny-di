var tiny = require('../dist/')();

function run() {
  tiny.bind('VALUE').to(5);
  var some = tiny.get('module/someModule');

  console.log('calc(10) is', some.calc(10));
}

run();
