module.exports = function app(dom, context) {
  var virtualDom = require('./compile/compile')(dom);
  var newDom = virtualDom(context).create();
  dom.parentNode.replaceChild(newDom, dom);
};
