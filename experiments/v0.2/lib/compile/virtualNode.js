/**
 * Each dom element gets a special 'virtual node' assigned to it. This helps
 * custom tags to bind to data model, and inspect its own children
 */

module.exports = virtualNode;

var BINDING_EXPR = /{{(.+?)}}/;

function virtualNode(domNode, virtualChildren, bindingGroup) {
  var bindingRules;

  return {
    children: virtualChildren,
    bind: bind,
    bindRule: bindRule,
    domNode: domNode
  };

  function bindRule(attributeName, valueChangedFactory) {
    if (!bindingRules) bindingRules = Object.create(null);
    bindingRules[attributeName] = valueChangedFactory;
  }

  function bind(model, target) {
    if (!domNode.attributes) return; // this might be a text. need to figure out what to do in that case

    var attrs = domNode.attributes;
    for (var i = 0; i < attrs.length; ++i) {
      bindDomAttribute(attrs[i], model, target);
    }
  }

  function bindDomAttribute(domAttribute, model, target) {
    var value = domAttribute.value;
    if (!value) return; // unary attribute?

    var modelNameMatch = value.match(BINDING_EXPR);
    if (!modelNameMatch) return; // does not look like a binding

    var attrName = domAttribute.localName;
    if (attrName[0] === '_') attrName = attrName.substr(1);

    var valueChanged = (bindingRules[attrName] || universalRule)(target, attrName);

    bindingGroup.createBinding(modelNameMatch[1], model, valueChanged);
  }
}

function universalRule(element, attrName) {
  return function (newValue) {
    element.setAttributeNS(null, attrName, newValue);
  };
}
