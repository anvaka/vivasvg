module.exports = compile;

var knownTags = Object.create(null);

function compile(domNode) {
  var children = domNode.children;
  var virtualDom = { children: [], domNode: domNode };
  for (var i = 0; i < children.length; ++i) {
    virtualDom.children.push(compile(children[i]));
  }

  var factory = knownTags[domNode.localName];
  if (!factory) factory = defaultFactory;

  return factory(virtualDom);
}

function defaultFactory(virtualRoot) {
  var template = virtualRoot.domNode.cloneNode(false);

  return function (model) {
    return {
      create: function () {
        var children = virtualRoot.children;
        forEach(children, appendToTemplate);
        for (var i = 0; i < children.length; ++i) {
          template.appendChild(children[i](model).create());
        }
        return template;
      }
    };
  };
}
