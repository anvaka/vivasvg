// make sure we have all our optimized binding rules setup:
require('./lib/binding/standardBindings');

/**
 * Expose binding rule factory for anyone to create new custom binding rules
 */
module.exports.bindingRule = require('./lib/binding/bindingRule').bindingRule;

/**
 * Let clients create new data models. Unlike angular, we require all models
 * to share same interface. This makes use of the binding sources somewhat
 * restrictive, but allows us to fine-tune performance at very low level.
 */
module.exports.model = require('./lib/binding/model');

// todo: do we need to expose this?
module.exports.bindingGroup = require('./lib/binding/bindingGroup');
