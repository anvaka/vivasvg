module.exports = {
  bootstrap: require('./lib/bootstrap')
};

var controls = require('./lib/controls');
Object.keys(controls).forEach(exportControl);

function exportControl(name) {
  module.exports[name] = controls[name];
}
