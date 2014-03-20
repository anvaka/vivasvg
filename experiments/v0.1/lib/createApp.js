module.exports = createApp;

var compiler = require('./compiler/compiler');

function createApp(dom, dataContext) {
  var bindingGroup = require('./binding/bindingGroup')();
  var link = compiler.compile(dom, bindingGroup);
  link(dataContext);

  return {
    run: run
  };

  function run() {
    requestAnimationFrame(run);
    bindingGroup.updateTargets();
  }
}
