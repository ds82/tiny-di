'use strict';

var TinyDi = require('../dist/');

describe('tiny-di', function() {

  var tiny;

  beforeEach(function() {
    tiny = new TinyDi();
    tiny.setResolver(fakeLoader);
  });

  it('bind->load should return module', function() {

    var test = tiny.bind('test').load('fake');
    expect(test).toEqual(Fake);
  });

  it('bind->to, get should return to object', function() {
    tiny.bind('some').to(Fake);
    expect(tiny.get('some')).toEqual(Fake);
  });

  it('bind->lazy, get should lazy load object', function() {

    var called = false;
    var stub = function() {
      called = true;
      return stub;
    };
    stub.$inject = [];

    tiny.setResolver(function() { return stub; });
    tiny.bind('stub').lazy('stub.test');

    expect(called).toEqual(false);
    expect(tiny.get('stub.test')).toEqual(stub);
    expect(called).toEqual(true);
  });

});

function fakeLoader(file) {
  return Fake;
}

Fake.$inject = [];
function Fake() {
  return Fake;
}
