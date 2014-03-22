/**
 * Tag library provides a way to register new dom tags
 */
var knownTags = Object.create(null);

// Default factory is used when requested tag is not known.
var defaultFactory = require('./default');

module.exports.getTag = function getTag(tagName) {
  return knownTags[tagName] || defaultFactory;
};

module.exports.createTag = function createTag(name, factory) {
  if (knownTags[name]) throw new Error('tag already registered: ' + name);
  knownTags[name] = factory;
};
