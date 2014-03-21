var defaultFactory = require('./default');
var knownTags = Object.create(null);

module.exports.getTag = function getTag(tagName) {
  return knownTags[tagName] || defaultFactory;
};

module.exports.createTag = function createTag(name, factory) {
  if (knownTags[name]) throw new Error('tag already registered: ' + name);
  knownTags[name] = factory;
};
