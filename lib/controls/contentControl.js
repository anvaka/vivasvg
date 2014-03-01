var createTag = require('../utils/createTag');
var extensions = require('../extensions');

module.exports = createTag('content', {
  _appendToDom: function (parentDom) {
    compileMarkup(this, parentDom);
  }
});

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
    var g = contentControl.createElement('g');
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
    var TagCtor = extensions.getTag(nodePrototype.localName);
    if (TagCtor) {
      // this is custom node, delegate its creation to handler
      var child = new TagCtor();
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
