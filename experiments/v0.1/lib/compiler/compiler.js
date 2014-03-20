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
}
