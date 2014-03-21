require('./lib/tags/standard');

module.exports.app = require('./lib/app');
module.exports.viewModel = require('./lib/binding/viewModel');
module.exports.createTag = require('./lib/tags/').createTag;
