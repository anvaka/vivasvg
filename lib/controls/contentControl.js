module.exports = ContentControl;

var UIElement = require('./uiElement');
var extensions = require('../extensions')();

function ContentControl() {
  if (!(this instanceof ContentControl)){
    return new ContentControl();
  }

  UIElement.call(this);
}

ContentControl.prototype = Object.create(UIElement.prototype);
ContentControl.prototype.constructor = ContentControl;

ContentControl.prototype._appendToDom = function (parentDom) {
  compileMarkup(this, parentDom);
};

function compileMarkup(contentControl, parentDom) {
  var nodes = contentControl._markup;
  var model = contentControl._dataContext;
  if (typeof nodes === 'string') {
    nodes = require('../utils/domParser')(nodes);
  }

  var bindingParser = require('../binding/parser')(model);
  var bindElement = require('../binding/element');

  // Trying to avoid extra dom elements when content control only has one child
  if (nodes.length === 1) {
    contentControl._dom = compileNode(nodes[0], parentDom);
  } else {
    var g = require('../utils/svg')('g');
    compileSubtree(nodes, g);
    parentDom.appendChild(g);
    contentControl._dom = g;
  }

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      compileNode(nodes[i], visualParent);
    }
  }

  function compileNode(nodePrototype, visualParent) {
    if (nodePrototype.localName in extensions) {
      // this is custom node, delegate its creation to handler
      var Ctor = extensions[nodePrototype.localName];
      var child = new Ctor();
      child.markup(nodePrototype);
      contentControl.appendChild(child, visualParent);
      return child._dom;
    } else {
      // regular svg, just add it to visual parent
      var node = nodePrototype.cloneNode(false);
      bindElement(node, bindingParser);

      visualParent.appendChild(node);
      var children = nodePrototype.childNodes;
      if (children && children.length > 0) {
        compileSubtree(children, node);
      }

      return node;
    }
  }
}
