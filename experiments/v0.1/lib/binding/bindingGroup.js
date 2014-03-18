/**
 * Binding group holds collection of bindings. Main reason why binding group
 * exists is to provide delayed update of binding targets.
 *
 * When binding source notifies a binding object about change, binding object
 * may not immediately update target. All updates should happen within
 * one call inside RequestAnimationFrame callback to optimize rendering performance
 *
 * Thus each binding object marks itself as dirty when source changes, and
 * registers itself within binding group for update when possible.
 */
module.exports = bindingGroup;

var getTagRules = require('./bindingRule').getTagRules;
var BINDING_EXPR = /{{(.+?)}}/;

function bindingGroup() {
  var dirtyBindings = [];
  var allBindings = []; // TODO: use this to dispose bindings.
  var dirtyLength = 0;

  return {
    bind: bind,
    updateTargets: updateTargets
  };

  function bind(target, viewModel) {
    var attributes = target.attributes;
    var tagBindingRules = getTagRules(target.localName);

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
        var binding = createBinding(targetSetter(target), propertyName, viewModel);
        allBindings.push(binding);
      }
    }
  }

  function createBinding(setter, propertyName, viewModel) {
    var binding = {
      isDirty: false,
      set : setter,
      source: undefined
    };

    viewModel.bind(propertyName, function (value) {
      binding.source = value;

      if (binding.isDirty) return; // already in the queue.
      binding.isDirty = true;
      dirtyBindings[dirtyLength++] = binding;
    });
  }

  function updateTargets() {
    if (!dirtyLength) return;
    for (var i = 0; i < dirtyLength; ++i) {
      var binding = dirtyBindings[i];
      binding.set(binding.source);
      binding.isDirty = false;
    }

    dirtyLength = 0;
  }
}
