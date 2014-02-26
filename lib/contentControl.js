module.exports = ContentControl;

var UIElement = require('./uiElement');
var extensions = require('./extensions')();

function ContentControl(protoNodes, model) {
  UIElement.call(this);

  if (typeof protoNodes === 'string') {
    protoNodes = require('./domParser')(protoNodes);
  }

  this._dom = compileProtoNodes(protoNodes, model, this);
}

ContentControl.prototype = Object.create(UIElement.prototype);
ContentControl.prototype.constructor = ContentControl;

function compileProtoNodes(nodes, model, logicalParent) {
  // TODO: group is not always required. E.g. when nodes length === 1, the node
  // itself should be returned
  var g = require('./svg')('g');
  var replacer = createBindReplacement(model);

  compileSubtree(nodes, g);

  return g;

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      var protoNode = nodes[i];
      if (protoNode.localName in extensions) {
        // this is custom node, delegate its creation to handler
        var Ctor = extensions[protoNode.localName];
        var child = new Ctor();
        child.markupPrototype(protoNode);
        logicalParent.appendChild(child, visualParent);
      } else {
        // regular svg, just add it to visual parent
        var cloneSubtree = protoNode.nodeType === 1; // text node
        var node = protoNode.cloneNode(cloneSubtree);
        bind(node, replacer);
        visualParent.appendChild(node);
        if (protoNode.children.length > 0) {
          compileSubtree(protoNode.children, node);
        }
      }
    }
  }
}

function bind(node, replacer) {
  var newValue;
  if (node.attributes) {
    for (var i = 0; i < node.attributes.length; ++i) {
      var attr = node.attributes[i];
      newValue = attr.nodeValue.replace(/{{(.+?)}}/, replacer);
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

function createBindReplacement(model) {
  return function bindingSubstitue(match, name) {
    var subtree = name.split('.');
    var localModel = model;

    for (var i = 0; i < subtree.length; ++i) {
      localModel = localModel[subtree[i]];
      // Attribute is not found on model. TODO: should we show warning?
      if (!localModel) return '';
    }

    return localModel;
  };
}
