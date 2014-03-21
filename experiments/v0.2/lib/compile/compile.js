module.exports = compile;

var knownTags = Object.create(null);

function compile(domNode) {
  var virtualChildren = [];
  var domChildren = domNode.children;
  for (var i = 0; i < domChildren.length; ++i) {
    virtualChildren.push(compile(domChildren[i]));
  }

  var tagFactory = knownTags[domNode.localName] || defaultFactory;
  return tagFactory({
    children: virtualChildren,
    domNode: domNode
  });
}

function defaultFactory(virtualRoot) {
  return function (model) {
    return {
      create: function () {
        var shallowCopy = virtualRoot.domNode.cloneNode(false);
        var children = virtualRoot.children;
        for (var i = 0; i < children.length; ++i) {
          shallowCopy.appendChild(children[i](model).create());
        }
        return shallowCopy;
      }
    };
  };
}
