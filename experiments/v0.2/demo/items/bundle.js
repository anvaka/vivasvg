;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');
var countMatch = window.location.href.match(/q=(\d+)/);
var count = (countMatch && countMatch[1]) || 100;
var svgApp = vivasvg.app(document.getElementById('scene'), createViewModel(count));
svgApp.run();


function createViewModel(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    viewModels.push(
      vivasvg.viewModel({ x: Math.random() * 640, y: Math.random() * 480, dx: Math.random() * 10 - 5 , dy: Math.random() * 10 - 5 })
    );
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

},{"../../vivasvg":9}],2:[function(require,module,exports){
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

  function createBinding(setter, propertyName, viewModel) {
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
      for (var j = 0; j < callbacks.length; ++j) {
        callbacks[j](rawObject[propertyName]);
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
var BINDING_EXPR = /{{(.+?)}}/;

function compile(domNode, bindingGroup) {
  var virtualChildren = [];
  var domChildren = domNode.children;
  for (var i = 0; i < domChildren.length; ++i) {
    virtualChildren.push(compile(domChildren[i], bindingGroup));
  }

  var tagFactory = tagLib.getTag(domNode.localName);
  return tagFactory({
    children: virtualChildren,
    attributes: compileAttributes(domNode, bindingGroup),
    domNode: domNode
  });
}

function compileAttributes(domNode, bindingGroup) {
  var observableAttributes = Object.create(null);
  var attributes = domNode.attributes;

  for (i = 0; i < attributes.length; ++i) {
    var attr = attributes[i];
    var observable = createObservableAttribute(attr, bindingGroup);
    if (observable) observableAttributes[observable.name] = observable;
  }

  return observableAttributes;
}

function createObservableAttribute(attribute, bindingGroup) {
  var value = attribute.value;
  var propertyMatch = value.match(BINDING_EXPR);
  if (!propertyMatch) return;

  var name = attribute.localName;
  if (name[0] === '_') name = name.substr(1);
  var propertyName = propertyMatch[1];

  return {
    name: name,
    observe: function (viewModel, valueChanged) {
      bindingGroup.createBinding(valueChanged, propertyName, viewModel);
    }
  };
}

},{"../tags/":7}],6:[function(require,module,exports){
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

        var attributes = virtualRoot.attributes;
        for (var name in attributes) {
          monitorAttribute(attributes[name], shallowCopy, model);
        }

        var children = virtualRoot.children;
        for (i = 0; i < children.length; ++i) {
          shallowCopy.appendChild(children[i](model).create());
        }

        return shallowCopy;
      }
    };
  };
}

function monitorAttribute(attribute, domElement, model) {
  attribute.observe(model, function (newValue) {
    domElement.setAttributeNS(null, attribute.name, newValue);
  });
}


},{}],7:[function(require,module,exports){
var defaultFactory = require('./default');
var knownTags = Object.create(null);

module.exports.getTag = function getTag(tagName) {
  return knownTags[tagName] || defaultFactory;
};

module.exports.createTag = function createTag(name, factory) {
  if (knownTags[name]) throw new Error('tag already registered: ' + name);
  knownTags[name] = factory;
};

},{"./default":6}],8:[function(require,module,exports){
var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  return function (model) {
    return {
      create: function () {
        var circle = virtual.domNode.cloneNode(false);
        var cx = virtual.attributes.cx;
        if (cx) {
          var acx = circle.cx.baseVal;
          cx.observe(model, function (newValue) { acx.value = newValue; });
        }
        var cy = virtual.attributes.cy;
        if (cy) {
          var acy = circle.cy.baseVal;
          cy.observe(model, function (newValue) { acy.value = newValue; });
        }
        return circle;
      }
    };
  };
});

createTag('items', function (virtual){
  return function (model) {
    return {
      create: function () {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var template = virtual.children[0];
        var itemsSource = virtual.attributes.source;

        itemsSource.observe(model, function (newValue) {
          for (var i = 0; i < newValue.length; ++i) {
            var model = newValue[i];
            g.appendChild(template(model).create());
          }
        });

        return g;
      }
    };
  };
});

},{"./index":7}],9:[function(require,module,exports){
require('./lib/tags/standard');

module.exports.app = require('./lib/app');
module.exports.viewModel = require('./lib/binding/viewModel');
module.exports.createTag = require('./lib/tags/').createTag;

},{"./lib/app":2,"./lib/binding/viewModel":4,"./lib/tags/":7,"./lib/tags/standard":8}]},{},[1])
;