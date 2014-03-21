;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');

vivasvg.app(document.getElementById('scene'), {x: 10, y: 10});

},{"../../vivasvg":4}],2:[function(require,module,exports){
module.exports = function app(dom, context) {
  var virtualDom = require('./compile/compile')(dom);
  var newDom = virtualDom(context).create();
  dom.parentNode.replaceChild(newDom, dom);
};

},{"./compile/compile":3}],3:[function(require,module,exports){
module.exports = compile;

var knownTags = Object.create(null);

function compile(domNode) {
  var children = domNode.children;
  var virtualDom = { children: [], domNode: domNode };
  for (var i = 0; i < children.length; ++i) {
    virtualDom.children.push(compile(children[i]));
  }

  var factory = knownTags[domNode.localName];
  if (!factory) factory = defaultFactory;

  return factory(virtualDom);
}

function defaultFactory(virtualRoot) {
  var template = virtualRoot.domNode.cloneNode(false);

  return function (model) {
    return {
      create: function () {
        var children = virtualRoot.children;
        for (var i = 0; i < children.length; ++i) {
          var child = children[i](model).create();
          template.appendChild(child);
        }
        return template;
      }
    };
  };
}

},{}],4:[function(require,module,exports){
module.exports.app = require('./lib/app');

},{"./lib/app":2}]},{},[1])
;