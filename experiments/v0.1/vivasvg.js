/**
 * Expose binding rule factory for anyone to create new custom binding rules
 */
module.exports.bindingRule = require('./lib/binding/bindingRule').bindingRule;
// make sure we have all our optimized binding rules setup:
require('./lib/binding/standardBindings');

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
    var tagBindingRules = require('./lib/binding/bindingRule').getTagRules(tagName);
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
      set : setter(target),
      source: undefined
    };

    model.on(propertyName, function () {
      binding.source = model[propertyName]; // todo: what if property has nested call? foo.x?

      if (binding.isDirty) return; // already in the queue.
      binding.isDirty = true;
      dirtyBindings[dirtyLength++] = binding;
    });
  }

  function updateTargets() {
    for (var i = 0; i < dirtyLength; ++i) {
      var binding = dirtyBindings[i];
      binding.set(binding.source);
      binding.isDirty = false;
    }

    dirtyLength = 0;
  }
}
