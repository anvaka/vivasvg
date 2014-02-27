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

ContentControl.prototype.markupPrototype = function (markup) {
  this._markup = markup;
};

ContentControl.prototype._appendToDom = function (parentDom) {
  var markup = this._markup;
  if (typeof markup === 'string') {
    markup = require('../utils/domParser')(markup);
  }

  this._dom = compileProtoNodes(markup, this._dataContext, this);
  if (this._dom) {
    parentDom.appendChild(this._dom);
  }
};

function compileProtoNodes(nodes, model, logicalParent) {
  // TODO: group is not always required. E.g. when nodes length === 1, the node
  // itself should be returned
  var replacer = require('../utils/bindingReplace')(model);
  var g = require('../utils/svg')('g');
  compileSubtree(nodes, g);

  return g;

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      compileNode(nodes[i], visualParent);
    }
  }

  function compileNode(protoNode, visualParent) {
    if (protoNode.localName in extensions) {
      // this is custom node, delegate its creation to handler
      var Ctor = extensions[protoNode.localName];
      var child = new Ctor();
      child.dataContext(model);
      child.markupPrototype(protoNode);
      logicalParent.appendChild(child, visualParent);
      return child._dom;
    } else {
      // regular svg, just add it to visual parent
      var cloneSubtree = protoNode.nodeType === 1; // text node
      var node = protoNode.cloneNode(cloneSubtree);
      bind(node, replacer);
      if (!visualParent) {
        visualParent = require('../utils/svg')('g');
      }
      visualParent.appendChild(node);
      var children = protoNode.children;
      if (children && children.length > 0) {
        compileSubtree(children, node);
      }

      return visualParent;
    }
  }
}

function bind(node, replacer) {
  var newValue;
  if (node.attributes) {
    for (var i = 0; i < node.attributes.length; ++i) {
      var attr = node.attributes[i];
      newValue = attr.nodeValue.replace(/{{(.+?)}}/g, replacer);
      if (attr.nodeValue !== newValue) {
        node.setAttributeNS(attr.namespaceURI, attr.localName, newValue);
      }
    }
  }
  if (node.nodeType === 1) { // TEXT_NODE
    newValue = node.textContent.replace(/{{(.+?)}}/g, replacer);
    if (newValue !== node.textContent) {
      node.textContent = newValue;
    }
  }
}
