module.exports = function app(dom, context) {
  var virtualDom = require('./compile/compile')(dom);
  var newDom = virtualDom.create(context);
  var parent = dom.parentNode;
  parent.replaceChild(newDom, dom);
};
