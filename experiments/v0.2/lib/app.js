module.exports = function app(dom, context) {
  var virtualDom = require('./compile/compile')(dom);
  virtualDom(context).appendTo(dom.parentNode);
  dom.parentNode.removeChild(dom);
};
