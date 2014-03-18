// make sure we have all our optimized binding rules setup:
require('./lib/binding/standardBindings');

/**
 * Expose binding rule factory for anyone to create new custom binding rules
 */
module.exports.bindingRule = require('./lib/binding/bindingRule').bindingRule;

// todo: do we need to expose this?
module.exports.bindingGroup = require('./lib/binding/bindingGroup');

module.exports.model = model;

var eventify = require('ngraph.events');
function model(rawObject) {
  eventify(rawObject);
  return rawObject;
}

