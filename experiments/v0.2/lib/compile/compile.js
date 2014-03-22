/**
 * Compiler traverses dom tree and produces virtual dom, which later
 * can be injected with data context and rendered/appended to any parent
 */
module.exports = compile;

var tagLib = require('../tags/');
var BINDING_EXPR = /{{(.+?)}}/;

function compile(domNode, bindingGroup) {
  if (domNode.nodeType !== 1) return; // todo: how about text nodes?

  var virtualChildren = [];
  if (domNode.hasChildNodes()) {
    var domChildren = domNode.childNodes;
    for (var i = 0; i < domChildren.length; ++i) {
      var virtualChild = compile(domChildren[i], bindingGroup);
      if (virtualChild) virtualChildren.push(virtualChild);
    }
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
  if (attributes) {
    for (i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      var observable = createObservableAttribute(attr, bindingGroup);
      if (observable) {
        observableAttributes[observable.name] = observable;
      }
    }
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
