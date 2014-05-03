module.exports = function app(dom, context) {
  var bindingGroup = require('./binding/bindingGroup')();
  var virtualDom = require('./compile/compile')(dom, bindingGroup);
  var newDom = virtualDom.create(context);
  var parent = dom.parentNode;
  parent.replaceChild(newDom, dom);

  return {
    run: run
  };

  function run() {
  }
};
