/**
 * Just an experimental binding provider
 */
module.exports.makeBinding = makeBinding;
module.exports.model = model;
module.exports.bindingGroup = bindingGroup;

var eventify = require('ngraph.events');
function model(rawObject) {
  eventify(rawObject);
  return rawObject;
}

function bindingGroup() {
  var dirtyBindings = [];
  var dirtyLength = 0;

  return {
    run: run,
    bind: bind
  };

  function run() {
    requestAnimationFrame(run);
    if (dirtyLength) {
      updateTargets();
    }
  }

  function bind(target, source) {
    var cx = registeredBindings.circle.cx;
    var bindingX = {
      set: registeredBindings.circle.cx,
      target: target,
      source: function () { return source.x; }
    };
    source.on('x', function () {
      dirtyBindings[dirtyLength++] = bindingX;
    });

    var cy = registeredBindings.circle.cy;
    var bindingY = {
      set: registeredBindings.circle.cy,
      target: target,
      source: function () { return source.y; }
    };

    source.on('y', function () {
      dirtyBindings[dirtyLength++] = bindingY;
    });
  }

  function updateTargets() {
    for (var i = 0; i < dirtyLength; ++i) {
      var binding = dirtyBindings[i];
      binding.set(binding.target, binding.source());
    }
    dirtyLength = 0;
  }
}

var registeredBindings = Object.create(null);
function makeBinding(elementName, attrName, cb) {
  var elementBindings = registeredBindings[elementName];
  if (!elementBindings) {
    elementBindings = registeredBindings[elementName] = Object.create(null);
  }
  var attrBindings = elementBindings[attrName];
  if (!attrBindings) {
    elementBindings[attrName] = cb;
  } else {
    throw new Error('Element ' + elementName + ' already has registered binding for '  + attrName);
  }
}
