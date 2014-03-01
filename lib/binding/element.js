var domEvents = require('../utils/domEvents');

module.exports = function (element, bindingParser) {
  var binding;
  var attributes = element.attributes;
  if (attributes) {
    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      binding = bindingParser.parse(attr.nodeValue);
      if (binding) {
        if (isEvent(attr.localName)) {
          // TODO: add actual binding support. Currently it is initialized only
          var eventName = attr.localName.substr(2);
          var eventHandler = createEventHandler(binding);
          domEvents.on(element, eventName, eventHandler);
          // replace dispose method, to detach listener:
          binding.off = disposeEventListner(binding, element, eventName, eventHandler);
          element.removeAttributeNode(attr); // no need to have browser collisions
        } else {
          element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
          var activeProperties = binding.activeProperties;
          var boundPropertiesCount = activeProperties.length;
          if (boundPropertiesCount === 1) {
            binding.on(activeProperties[0], onAttributeChanged(element, attr, binding));
          } else if (boundPropertiesCount > 1) {
            var propertyChanged = onAttributeChanged(element, attr, binding);
            for (var j = 0; j < boundPropertiesCount; ++j) {
              binding.on(activeProperties[j], propertyChanged);
            }
          }
        }
      }
    }
  }

  if (element.nodeType === 3) { // TEXT_NODE
    binding = bindingParser.parse(element.nodeValue);
    if (binding) {
      element.nodeValue = binding.provide();
    }
  }

  return binding;
};

function disposeEventListner (binding, element, eventName, listener) {
  prevOff = binding.off;
  return function () {
    prevOff();
    domEvents.off(element, eventName, listener);
  };
}

function onAttributeChanged(element, attr, binding) {
  return function () {
    element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
  };
}

function createEventHandler(binding) {
  var original = binding.provide();
  var model = binding.model;
  return function (e) {
    original(e, model);
  };
}

function isEvent(targetName) {
  return targetName.length > 2 &&
         targetName[0] === 'o' &&
         targetName[1] === 'n';
}
