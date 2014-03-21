module.exports = function app(dom, context) {
  var bindingGroup = require('./binding/bindingGroup')();
  var virtualDom = require('./compile/compile')(dom, bindingGroup);
  var newDom = virtualDom(context).create();
  dom.parentNode.replaceChild(newDom, dom);

  return {
    run: run
  };

  function run() {
    requestAnimationFrame(run);
    bindingGroup.updateTargets();
  }
};
