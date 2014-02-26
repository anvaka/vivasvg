module.exports = ContentControl;

var UIElement = require('./uiElement');

function ContentControl(protoNodes, model) {
  UIElement.call(this);

  this._dom = compileProtoNodes(protoNodes, model);
}

ContentControl.prototype = Object.create(UIElement.prototype);

var extensions = {};

function compileProtoNodes(nodes, model) {
  var g = require('./svg')('g');
  var replacer = createBindReplacement(model);

  compileSubtree(nodes, g);

  return g;

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      var protoNode = nodes[i];
      if (protoNode.localName in extensions) {
        // this is custom node, delegate its creation to handler
      } else {
        // regular svg, just add it to root
        var node = protoNode.cloneNode();
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
  } else if (node.nodeType === 1) { // TEXT_NODE
    newValue = node.nodeValue.replace(/{{(.+?)}}/g, bindingReplacement);
    if (newValue !== node.nodeValue) {
      node.nodeValue = newValue;
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
