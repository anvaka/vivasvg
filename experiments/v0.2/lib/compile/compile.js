module.exports = compile;

var BINDING_EXPR = /{{(.+?)}}/;
var knownTags = Object.create(null);

function compile(domNode, bindingGroup) {
  var virtualChildren = [];
  var domChildren = domNode.children;
  for (var i = 0; i < domChildren.length; ++i) {
    virtualChildren.push(compile(domChildren[i], bindingGroup));
  }

  var observableAttributes = [];
  var attributes = domNode.attributes;
  for (i = 0; i < attributes.length; ++i) {
    var attr = attributes[i];
    var observable = createObservableAttribute(attr, bindingGroup);
    if (observable) observableAttributes.push(observable);
  }

  var tagFactory = knownTags[domNode.localName] || defaultFactory;
  return tagFactory({
    children: virtualChildren,
    attributes: observableAttributes,
    domNode: domNode
  });
}

function defaultFactory(virtualRoot) {
  return function (model) {
    return {
      create: function create() {
        var i;
        var shallowCopy = virtualRoot.domNode.cloneNode(false);

        var attributes = virtualRoot.attributes;
        for (i = 0; i < attributes.length; ++i) {
          monitorAttribute(attributes[i], shallowCopy, model);
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

function createObservableAttribute(attribute, bindingGroup) {
  var value = attribute.value;
  var propertyMatch = value.match(BINDING_EXPR);
  if (!propertyMatch) return;

  var name = attribute.localName;
  if (name[0] === '_') name = name.substr(1);
  var propertyName = propertyMatch[1];

  return {
    name: name,
    observe: function (viewModel, valueChanged) {
      bindingGroup.createBinding(valueChanged, propertyName, viewModel);
    }
  };
}
