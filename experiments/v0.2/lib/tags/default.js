/**
 * If compiler does not know how to compile a tag it will fallback to this method.
 */
module.exports = defaultFactory;

function defaultFactory(virtualRoot) {
  return {
    create: function create(model) {
      var i;
      var shallowCopy = virtualRoot.domNode.cloneNode(false);
      virtualRoot.bind(model, shallowCopy);

      var children = virtualRoot.children;
      for (i = 0; i < children.length; ++i) {
        shallowCopy.appendChild(children[i].create(model));
      }

      return shallowCopy;
    }
  };
}
