module.exports = {
  Collection: require('./lib/binding/collection'),
  model: require('./lib/binding/model'),
  svg: require('./lib/utils/svg'),
  bootstrap: require('./lib/bootstrap'),
  bindingParser: require('./lib/binding/parser'),
  registerControl: function (name, ctor) {
    // todo: name collisions?
    var extensions = require('./lib/extensions')();
    extensions[name] = ctor;
  }
};

var controls = require('./lib/controls');
Object.keys(controls).forEach(exportControl);

function exportControl(name) {
  module.exports[name] = controls[name];
}
