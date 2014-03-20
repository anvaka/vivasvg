// make sure we have all our optimized binding rules setup:
require('./lib/binding/standardBindings');
require('./lib/compiler/standardTags');

/**
 * Expose binding rule factory for anyone to create new custom binding rules
 */
module.exports.bindingRule = require('./lib/binding/bindingRule').bindingRule;

/**
 * Let clients create new view models. Unlike angular, we require all view models
 * to share same interface. This makes use of the data sources somewhat
 * restrictive, but allows us to fine-tune performance at very low level.
 */
module.exports.viewModel = require('./lib/binding/viewModel');

// todo: do we need to expose this?
module.exports.bindingGroup = require('./lib/binding/bindingGroup');

module.exports.createApp = require('./lib/createApp');
