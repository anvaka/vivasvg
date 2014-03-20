var tagLib = Object.create(null);

module.exports.compile = compile;

module.exports.createTag = createTag;

function createTag(tagName, creator) {
  if (typeof creator !== 'function') {
    throw new Error('Tag ' + tagName + ' cannot be created since creator is not a function');
  }

  var registeredTag = tagLib[tagName];
  if (registeredTag) {
    throw new Error('Tag ' + tagName + ' already registered');
  } else {
    tagLib[tagName] = creator;
  }
}

function compile(root, bindingGroup) {
  var tag = tagLib[root.localName];
  var childLink;

  if (tag) {
    var dom = tag(root, nestedCompile);
    if (dom && root.parentElement) {
      root.parentElement.replaceChild(dom, root);
    }
  } else {
    var children = root.children;
    if (children.length) childLink = [];
    for (var i = 0; i < children.length; ++i) {
      childLink.push(compile(children[i], bindingGroup));
    }
  }

  return function (model) {
    if (childLink) {
      for (var i = 0; i < childLink.length; ++i) {
        childLink[i](model);
      }
    }

    bindingGroup.bind(root, model);
    return dom || root;
  };

  function nestedCompile(root) {
    return compile(root, bindingGroup);
  }
}
