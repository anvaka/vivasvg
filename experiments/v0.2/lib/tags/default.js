/**
 * If compiler does not know how to compile a tag it will fallback to this method.
 */
module.exports = defaultFactory;

function defaultFactory(virtualRoot) {
  return function (model) {
    return {
      create: function create() {
        var i;
        var shallowCopy = virtualRoot.domNode.cloneNode(false);

        var attributes = virtualRoot.attributes;
        for (var name in attributes) {
          monitorAttribute(attributes[name], shallowCopy, model);
        }

        var children = virtualRoot.children;
        for (i = 0; i < children.length; ++i) {
          shallowCopy.appendChild(children[i](model).create());
        }

        return shallowCopy;
      }
    };
  };
}

function monitorAttribute(attribute, domElement, model) {
  attribute.observe(model, function (newValue) {
    domElement.setAttributeNS(null, attribute.name, newValue);
  });
}

