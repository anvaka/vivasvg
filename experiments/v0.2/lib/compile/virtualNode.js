/**
 * Each dom element gets a special 'virtual node' assigned to it. This helps
 * custom tags to bind to data model, and inspect its own children
 */

module.exports = virtualNode;

var BINDING_EXPR = /{{(.+?)}}/;

function virtualNode(domNode, virtualChildren, bindingGroup) {
  return {
    children: virtualChildren,
    bind: bind,
    domNode: domNode
  };

  function bind(attributeName, model, valueChanged) {
    if (!domNode.attributes) return; // this might be a text. need to figure out what to do in that case

    if (arguments.length === 3) {
      bindConcreateAttribute(attributeName, model, valueChanged);
    } else {
      bindAllAttributes(attributeName, model);
    }
  }

  function bindConcreateAttribute(attributeName, model, valueChanged) {
    var attr = domNode.attributes[attributeName] || domNode.attributes['_' + attributeName];
    if (!attr) return; // no such attribute on dom node

    var value = attr.value;
    if (!value) return; // Unary attribute?

    var modelNameMatch = value.match(BINDING_EXPR);
    if (!modelNameMatch) return; // Attribute found, does not look like a binding

    bindingGroup.createBinding(modelNameMatch[1], model, valueChanged);
  }

  function bindAllAttributes(model, valueChanged) {
    var attrs = domNode.attributes;
    for (var i = 0; i < attrs.length; ++i) {
      bindDomAttribute(attrs[i], model, bindingGroup, valueChanged);
    }
  }
}

function bindDomAttribute(domAttribute, model, bindingGroup, valueChanged) {
  var value = domAttribute.value;
  if (!value) return;

  var modelNameMatch = value.match(BINDING_EXPR);
  if (!modelNameMatch) return;

  // this is really inefficient, clients should override this with concrete bindings:
  var attrName = domAttribute.localName;
  if (attrName[0] === '_') attrName = attrName.substr(1);
  bindingGroup.createBinding(modelNameMatch[1], model, function (newValue) {
    valueChanged(attrName, newValue);
  });
}
