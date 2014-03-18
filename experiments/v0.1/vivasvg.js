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
  var allBindings = []; // use this to dispose bindings.
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
    var attributes = target.attributes;
    var tagName = target.localName;
    var tagBindingRules = registeredBindings[tagName];
    var BINDING_EXPR = /{{(.+?)}}/;
    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      var value = attr.value;
      var propertyMatch = value.match(BINDING_EXPR);
      if (!propertyMatch) continue;

      var propertyName = propertyMatch[1];
      var attrName = attr.localName;
      // Since SVG attribute values are very restrictive we cannot set them to
      // {{foo}}. Thus we allow to have "mirror" attribute names prefixed with _
      if (attrName[0] === '_') attrName = attrName.substr(1);
      var targetSetter = tagBindingRules[attrName];
      if (targetSetter) {
        allBindings.push(createBinding(targetSetter, propertyName, source, target));
      }
    }
  }

  function createBinding(setter, propertyName, model, target) {
    var binding = {
      isDirty: false,
      set : setter,
      target: target,
      source: function () { return model[propertyName]; } // todo: what if property has nested call? foo.x?
    };

    model.on(propertyName, function () {
      if (binding.isDirty) return; // already in the queue.
      binding.isDirty = true;
      dirtyBindings[dirtyLength++] = binding;
    });
  }

  function updateTargets() {
    for (var i = 0; i < dirtyLength; ++i) {
      var binding = dirtyBindings[i];
      binding.set(binding.target, binding.source());
      binding.isDirty = false;
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
