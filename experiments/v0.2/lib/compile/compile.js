/**
 * Compiler traverses dom tree and produces virtual dom, which later
 * can be injected with data context and rendered/appended to any parent
 */
module.exports = compile;

var tagLib = require('../tags/');
var BINDING_EXPR = /{{(.+?)}}/;

function compile(domNode, bindingGroup) {
  var virtualChildren = [];
  var domChildren = domNode.children;
  for (var i = 0; i < domChildren.length; ++i) {
    virtualChildren.push(compile(domChildren[i], bindingGroup));
  }

  var tagFactory = tagLib.getTag(domNode.localName);
  return tagFactory({
    children: virtualChildren,
    attributes: compileAttributes(domNode, bindingGroup),
    domNode: domNode
  });
}

function compileAttributes(domNode, bindingGroup) {
  var observableAttributes = Object.create(null);
  var attributes = domNode.attributes;

  for (i = 0; i < attributes.length; ++i) {
    var attr = attributes[i];
    var observable = createObservableAttribute(attr, bindingGroup);
    if (observable) observableAttributes[observable.name] = observable;
  }

  return observableAttributes;
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
