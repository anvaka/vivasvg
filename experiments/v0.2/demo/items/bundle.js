(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');
var countMatch = window.location.href.match(/q=(\d+)/);
var count = (countMatch && countMatch[1]) || 100;
var svgApp = vivasvg.app(document.getElementById('scene'), createViewModel(count));
svgApp.run();


function createViewModel(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    var xSpeed = Math.random() * 10 - 5;
    var ball = {
      x: Math.random() * 640,
      y: Math.random() * 480,
      dx: xSpeed,
      dy: Math.random() * 10 - 5,
    };

    viewModels.push(vivasvg.viewModel(ball));
  }

  render();

  return vivasvg.viewModel({
    circles: viewModels
  });

  function render() {
    requestAnimationFrame(render);

    for (var i = 0; i < viewModels.length; ++i) {
      var model = viewModels[i];
      model.x += model.dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += model.dx; }
      model.y += model.dy; if (model.y < 0 || model.y > 480 ) { model.dy *= -1; model.y += model.dy; }
      model.invalidate('x', 'y');
    }
  }
}

},{"../../vivasvg":9}],2:[function(require,module,exports){
module.exports = function app(dom, context) {
  var virtualDom = require('./compile/compile')(dom);
  var newDom = virtualDom.create(context);
  var parent = dom.parentNode;
  parent.replaceChild(newDom, dom);

  return {
    run: run
  };

  function run() {
  }
};

},{"./compile/compile":4}],3:[function(require,module,exports){

module.exports = viewModel;

function viewModel(rawObject) {
  var boundProperties = Object.create(null);

  rawObject.bind = function (propertyName, changed) {
    var callbacks = boundProperties[propertyName];
    if (!callbacks) {
      callbacks = boundProperties[propertyName] = [];
    }
    callbacks.push(changed);
  };

  rawObject.invalidate = function () {
    // todo this should somehow be executed inside raf
    for (var i = 0; i < arguments.length; ++i) {
      var propertyName = arguments[i];
      var callbacks = boundProperties[propertyName];
      if (callbacks) {
        for (var j = 0; j < callbacks.length; ++j) {
          callbacks[j](rawObject[propertyName]);
        }
      }
    }
  };

  return rawObject;
}

},{}],4:[function(require,module,exports){
/**
 * Compiler traverses dom tree and produces virtual dom, which later
 * can be injected with data context and rendered/appended to any parent
 */
module.exports = compile;

var tagLib = require('../tags/');
var createVirtualNode = require('./virtualNode');

function compile(domNode) {
  if (domNode.nodeType !== 1) return; // todo: how about text nodes?

  // first we collect virtual children
  var virtualChildren = [];
  if (domNode.hasChildNodes()) {
    var domChildren = domNode.childNodes;
    for (var i = 0; i < domChildren.length; ++i) {
      var virtualChild = compile(domChildren[i]);
      if (virtualChild) virtualChildren.push(virtualChild);
    }
  }

  // then we instantiate current node,
  var tagFactory = tagLib.getTag(domNode.localName);
  var virtualNode = createVirtualNode(domNode, virtualChildren);

  return tagFactory(virtualNode);
}


},{"../tags/":7,"./virtualNode":5}],5:[function(require,module,exports){
/**
 * Each dom element gets a special 'virtual node' assigned to it. This helps
 * custom tags to bind to data model, and inspect its own children
 */

module.exports = virtualNode;

var BINDING_EXPR = /{{(.+?)}}/;

function virtualNode(domNode, virtualChildren) {
  var attributeRules;

  return {
    children: virtualChildren,
    bind: bind,
    attribute: attribute,
    domNode: domNode
  };

  function attribute(attributeName, valueChangedFactory) {
    if (!attributeRules) attributeRules = Object.create(null);
    attributeRules[attributeName] = valueChangedFactory;
  }

  function bind(model, target) {
    if (!domNode.attributes) return; // this might be a text. need to figure out what to do in that case

    var attrs = domNode.attributes;
    for (var i = 0; i < attrs.length; ++i) {
      bindDomAttribute(attrs[i], model, target);
    }
  }

  function bindDomAttribute(domAttribute, model, target) {
    var value = domAttribute.value;
    if (!value) return; // unary attribute?

    var modelNameMatch = value.match(BINDING_EXPR);
    if (!modelNameMatch) return; // does not look like a binding

    var attrName = domAttribute.localName;
    if (attrName[0] === '_') attrName = attrName.substr(1);

    var valueChanged = (attributeRules[attrName] || universalRule)(target, attrName);

    model.bind(modelNameMatch[1], valueChanged);
    model.invalidate(modelNameMatch[1]);
  }
}

function universalRule(element, attrName) {
  return function (newValue) {
    element.setAttributeNS(null, attrName, newValue);
  };
}

},{}],6:[function(require,module,exports){
/**
 * If compiler does not know how to compile a tag it will fallback to this method.
 */
module.exports = defaultFactory;

function defaultFactory(virtualRoot) {
  return {
    create: function create(model) {
      var i;
      var shallowCopy = virtualRoot.domNode.cloneNode(false);
      virtualRoot.bind(model, shallowCopy);

      var children = virtualRoot.children;
      for (i = 0; i < children.length; ++i) {
        shallowCopy.appendChild(children[i].create(model));
      }

      return shallowCopy;
    }
  };
}

},{}],7:[function(require,module,exports){
/**
 * Tag library provides a way to register new dom tags
 */
var knownTags = Object.create(null);

// Default factory is used when requested tag is not known.
var defaultTag = require('./default');

module.exports.getTag = function getTag(tagName) {
  return knownTags[tagName] || defaultTag;
};

module.exports.createTag = function createTag(name, factory) {
  if (knownTags[name]) throw new Error('tag already registered: ' + name);
  knownTags[name] = factory;
};

},{"./default":6}],8:[function(require,module,exports){
var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  // Define optimized binding rules for circle:
  virtual.attribute('cx', sizeRule('cx'));
  virtual.attribute('cy', sizeRule('cy'));
  virtual.attribute('r', sizeRule('r'));

  return {
    create: function (model) {
      var circle = virtual.domNode.cloneNode(false);
      virtual.bind(model, circle);
      return circle;
    }
  };
});

/**
 * Creates optimized binding for SVGSize attribute
 */
function sizeRule (attr) {
  return function (element) {
    return function (newValue) {
      element[attr].baseVal.value = newValue;
    };
  };
}

createTag('items', function (itemsTag) {
  itemsTag.attribute('source', itemsSourceRule);

  return {
    create: function (model) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      itemsTag.bind(model, { g: g, template: itemsTag.children[0]});

      return g;
    }
  };

  function itemsSourceRule(itemsControl) {
    return function (newValue) {
      for (var i = 0; i < newValue.length; ++i) {
        var child = itemsControl.template.create(newValue[i]);
        itemsControl.g.appendChild(child);
      }
    };
  }
});

},{"./index":7}],9:[function(require,module,exports){
require('./lib/tags/standard');

module.exports.app = require('./lib/app');
module.exports.viewModel = require('./lib/binding/viewModel');
module.exports.createTag = require('./lib/tags/').createTag;

},{"./lib/app":2,"./lib/binding/viewModel":3,"./lib/tags/":7,"./lib/tags/standard":8}]},{},[1])