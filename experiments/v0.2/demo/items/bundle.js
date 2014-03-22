;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');
var countMatch = window.location.href.match(/q=(\d+)/);
var count = (countMatch && countMatch[1]) || 100;
var svgApp = vivasvg.app(document.getElementById('scene'), createViewModel(count));
svgApp.run();


function createViewModel(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    var xSpeed = Math.random() * 10 - 5;
    var color = Math.round(0.5 * xSpeed + 5);
    color = '#' + ((color << 32) + (color << 16) + color);
    var ball = {
      x: Math.random() * 640,
      y: Math.random() * 480,
      dx: xSpeed,
      dy: Math.random() * 10 - 5,
      fill: color
    };

    viewModels.push(vivasvg.viewModel(ball));
  }

  // Start animation loop (yes, outside of RAF, this is totally OK):
  setInterval(function () {
    for (var i = 0; i < viewModels.length; ++i) {
      model = viewModels[i];
      model.x += model.dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += model.dx; }
      model.y += model.dy; if (model.y < 0 || model.y > 480 ) { model.dy *= -1; model.y += model.dy; }
      model.invalidate('x', 'y');
    }
  }, 1000/60);

  return vivasvg.viewModel({
    circles: viewModels
  });
}

},{"../../vivasvg":10}],2:[function(require,module,exports){
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

},{"./binding/bindingGroup":3,"./compile/compile":5}],3:[function(require,module,exports){
/**
 * Binding group holds collection of bindings. Main reason why binding group
 * exists is to provide delayed update of binding targets.
 *
 * When binding source notifies a binding object about change, binding object
 * may not immediately update target. All updates should happen within
 * one call inside RequestAnimationFrame callback to optimize rendering performance
 *
 * Thus each binding object marks itself as dirty when source changes, and
 * registers itself within binding group for update when possible.
 */
module.exports = bindingGroup;

var BINDING_EXPR = /{{(.+?)}}/;

function bindingGroup() {
  var dirtyBindings = [];
  var dirtyLength = 0;

  return {
    createBinding: createBinding,
    updateTargets: updateTargets
  };

  function createBinding(propertyName, viewModel, setter) {
    var binding = {
      isDirty: false,
      set : setter,
      source: undefined
    };

    viewModel.bind(propertyName, function (value) {
      binding.source = value;

      if (binding.isDirty) return; // already in the queue.
      binding.isDirty = true;
      dirtyBindings[dirtyLength++] = binding;
    });

    viewModel.invalidate(propertyName);
  }

  function updateTargets() {
    if (!dirtyLength) return;
    for (var i = 0; i < dirtyLength; ++i) {
      var binding = dirtyBindings[i];
      binding.set(binding.source);
      binding.isDirty = false;
    }

    dirtyLength = 0;
  }
}

},{}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){
/**
 * Compiler traverses dom tree and produces virtual dom, which later
 * can be injected with data context and rendered/appended to any parent
 */
module.exports = compile;

var tagLib = require('../tags/');
var createVirtualNode = require('./virtualNode');

function compile(domNode, bindingGroup) {
  if (domNode.nodeType !== 1) return; // todo: how about text nodes?

  var virtualChildren = [];
  if (domNode.hasChildNodes()) {
    var domChildren = domNode.childNodes;
    for (var i = 0; i < domChildren.length; ++i) {
      var virtualChild = compile(domChildren[i], bindingGroup);
      if (virtualChild) virtualChildren.push(virtualChild);
    }
  }

  var tagFactory = tagLib.getTag(domNode.localName);
  var virtualNode = createVirtualNode(domNode, virtualChildren, bindingGroup);

  return tagFactory(virtualNode);
}


},{"../tags/":8,"./virtualNode":6}],6:[function(require,module,exports){
/**
 * Each dom element gets a special 'virtual node' assigned to it. This helps
 * custom tags to bind to data model, and inspect its own children
 */

module.exports = virtualNode;

var BINDING_EXPR = /{{(.+?)}}/;

function virtualNode(domNode, virtualChildren, bindingGroup) {
  return {
    children: virtualChildren,
    bind: bind,
    domNode: domNode
  };

  function bind(attributeName, model, valueChanged) {
    if (!domNode.attributes) return; // this might be a text. need to figure out what to do in that case

    if (arguments.length === 3) {
      bindConcreateAttribute(attributeName, model, valueChanged);
    } else {
      bindAllAttributes(attributeName, model);
    }
  }

  function bindConcreateAttribute(attributeName, model, valueChanged) {
    var attr = domNode.attributes[attributeName] || domNode.attributes['_' + attributeName];
    if (!attr) return; // no such attribute on dom node

    var value = attr.value;
    if (!value) return; // Unary attribute?

    var modelNameMatch = value.match(BINDING_EXPR);
    if (!modelNameMatch) return; // Attribute found, does not look like a binding

    bindingGroup.createBinding(modelNameMatch[1], model, valueChanged);
  }

  function bindAllAttributes(model, valueChanged) {
    var attrs = domNode.attributes;
    for (var i = 0; i < attrs.length; ++i) {
      bindDomAttribute(attrs[i], model, bindingGroup, valueChanged);
    }
  }
}

function bindDomAttribute(domAttribute, model, bindingGroup, valueChanged) {
  var value = domAttribute.value;
  if (!value) return;

  var modelNameMatch = value.match(BINDING_EXPR);
  if (!modelNameMatch) return;

  // this is really inefficient, clients should override this with concrete bindings:
  var attrName = domAttribute.localName;
  if (attrName[0] === '_') attrName = attrName.substr(1);
  bindingGroup.createBinding(modelNameMatch[1], model, function (newValue) {
    valueChanged(attrName, newValue);
  });
}

},{}],7:[function(require,module,exports){
/**
 * If compiler does not know how to compile a tag it will fallback to this method.
 */
module.exports = defaultFactory;

function defaultFactory(virtualRoot) {
  return function (model) {
    return {
      create: function create() {
        var i;
        var shallowCopy = virtualRoot.domNode.cloneNode(false);

        // Since we are too generic, use inefficient DOM api to update attributes
        virtualRoot.bind(model, function (name, newValue) {
          shallowCopy.setAttributeNS(null, name, newValue);
        });

        var children = virtualRoot.children;
        for (i = 0; i < children.length; ++i) {
          shallowCopy.appendChild(children[i](model).create());
        }

        return shallowCopy;
      }
    };
  };
}

},{}],8:[function(require,module,exports){
/**
 * Tag library provides a way to register new dom tags
 */
var knownTags = Object.create(null);

// Default factory is used when requested tag is not known.
var defaultFactory = require('./default');

module.exports.getTag = function getTag(tagName) {
  return knownTags[tagName] || defaultFactory;
};

module.exports.createTag = function createTag(name, factory) {
  if (knownTags[name]) throw new Error('tag already registered: ' + name);
  knownTags[name] = factory;
};

},{"./default":7}],9:[function(require,module,exports){
var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  return function (model) {
    return {
      create: function () {
        var circle = virtual.domNode.cloneNode(false);

        virtual.bind('cx', model, function (x) { circle.cx.baseVal.value = x; });
        virtual.bind('cy', model, function (y) { circle.cy.baseVal.value = y; });
        virtual.bind('r', model, function (r) { circle.r.baseVal.value = r; });

        return circle;
      }
    };
  };
});

createTag('items', function (virtual){
  return function itemsControl(model) {
    return {
      create: function () {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var template = virtual.children[0];

        virtual.bind('source', model, function (newValue) {
          for (var i = 0; i < newValue.length; ++i) {
            var child = template(newValue[i]).create();
            g.appendChild(child);
          }
        });

        return g;
      }
    };
  };
});

},{"./index":8}],10:[function(require,module,exports){
require('./lib/tags/standard');

module.exports.app = require('./lib/app');
module.exports.viewModel = require('./lib/binding/viewModel');
module.exports.createTag = require('./lib/tags/').createTag;

},{"./lib/app":2,"./lib/binding/viewModel":4,"./lib/tags/":8,"./lib/tags/standard":9}]},{},[1])
;