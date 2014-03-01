module.exports = function (element, bindingParser) {
  var binding;
  var attributes = element.attributes;
  if (attributes) {
    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      binding = bindingParser.parse(attr.nodeValue);
      if (binding) {
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

  if (element.nodeType === 3) { // TEXT_NODE
    binding = bindingParser.parse(element.nodeValue);
    if (binding) {
      element.nodeValue = binding.provide();
    }
  }

  return binding;
};

function onAttributeChanged(element, attr, binding) {
  return function () {
    element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
  };
}
