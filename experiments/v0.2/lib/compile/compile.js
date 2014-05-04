/**
 * Compiler traverses dom tree and produces virtual dom, which later
 * can be injected with data context and rendered/appended to any parent
 */
module.exports = compile;

var tagLib = require('../tags/');
var createVirtualNode = require('./virtualNode');

function compile(domNode) {
  if (domNode.nodeType !== 1) return; // todo: how about text nodes?

  // first, we collect virtual children
  var virtualChildren = [];
  if (domNode.hasChildNodes()) {
    var domChildren = domNode.childNodes;
    for (var i = 0; i < domChildren.length; ++i) {
      var virtualChild = compile(domChildren[i]);
      if (virtualChild) virtualChildren.push(virtualChild);
    }
  }

  // then we instantiate current node,
  var tagFactory = tagLib.getTag(domNode.localName);
  var virtualNode = createVirtualNode(domNode, virtualChildren);

  return tagFactory(virtualNode);
}

