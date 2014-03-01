module.exports = {
  // data binding related
  collection: require('./lib/binding/collection'),
  model: require('./lib/binding/model'),
  bindingParser: require('./lib/binding/parser'),

  bootstrap: require('./lib/bootstrap'),
  createTag: require('./lib/utils/createTag'),

  svg: require('./lib/utils/svg')
};

// augment with base controls
var controls = require('./lib/controls');
Object.keys(controls).forEach(exportControl);

function exportControl(name) {
  module.exports[name] = controls[name];
}
