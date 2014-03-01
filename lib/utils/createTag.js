var UIElement = require('../controls/uiElement');
var extensions = require('../extensions');

var VALID_TAG_NAME = /^\w+$/;

module.exports = function (tagName, tagPrototype) {
  if (!VALID_TAG_NAME.test(tagName)) {
    throw new Error('tagName is expected to contain only word characters, but found: ' + tagName);
  }

  var functionBody = getFunctionTemplate(tagName);
  var ctor = (new Function('base', functionBody)(UIElement));

  ctor.prototype = Object.create(UIElement.prototype);
  ctor.prototype.constructor = ctor;

  Object.keys(tagPrototype).forEach(function (key) {
    ctor.prototype[key] = tagPrototype[key];
  });

  if (tagName) {
    extensions.register(tagName, ctor);
  }
  return ctor;
};

function getFunctionTemplate(tagName) {
  return ['return function ' + tagName + ' () {',
    'if (!(this instanceof ' + tagName +')){',
    '  return new ' + tagName + '();',
    '}',
    'base.call(this);',
  '}'].join('\n');
}
