/**
 * This file defines a factory method for new binding rules. Each rule is applicable
 * based on tag name/attribute name pair.
 */
module.exports.bindingRule = bindingRule;
module.exports.getTagRules = getTagRules;

// This is a dictionary of all known bindings.
//   tagName => [attrName1, attrName2, ...]
//     attrName1 => function customSetter() {}
//     attrName2 => function customSetter() {}
// TODO: Add wildcard rules. E.g. * -> * -> element.setAttributeNS();
var knownBindings = Object.create(null);

function bindingRule(tagName, attrName, setter) {
  if (typeof setter !== 'function') {
    throw new Error('Setter is expected to be a function, found: ', setter);
  }

  var tagRules = knownBindings[tagName];
  if (!tagRules) {
    // tag rules contains binding rules for each attribute on this tag
    tagRules = knownBindings[tagName] = Object.create(null);
  }
  if (!tagRules[attrName]) {
    tagRules[attrName] = setter;
  } else {
    throw new Error('Element ' + tagName + ' already has registered binding for '  + attrName);
  }
}

function getTagRules(tagName) {
  return knownBindings[tagName];
}
