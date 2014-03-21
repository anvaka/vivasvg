;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');

var dataContext = vivasvg.viewModel({x: 320, y: 240});
var app = vivasvg.app(document.getElementById('scene'), dataContext);
app.run();

setInterval(function () {
  dataContext.x += Math.random() * 8 - 4;
  dataContext.y += Math.random() * 8 - 4;
  dataContext.invalidate('x', 'y');
}, 1000/60);

},{"../../vivasvg":7}],2:[function(require,module,exports){
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
module.exports = compile;

var BINDING_EXPR = /{{(.+?)}}/;
var knownTags = Object.create(null);
var defaultFactory = require('./tags/default');

function compile(domNode, bindingGroup) {
  var virtualChildren = [];
  var domChildren = domNode.children;
  for (var i = 0; i < domChildren.length; ++i) {
    virtualChildren.push(compile(domChildren[i], bindingGroup));
  }

  var tagFactory = knownTags[domNode.localName] || defaultFactory;
  return tagFactory({
    children: virtualChildren,
    attributes: compileAttributes(domNode, bindingGroup),
    domNode: domNode
  });
}

function compileAttributes(domNode, bindingGroup) {
  var observableAttributes = [];
  var attributes = domNode.attributes;

  for (i = 0; i < attributes.length; ++i) {
    var attr = attributes[i];
    var observable = createObservableAttribute(attr, bindingGroup);
    if (observable) observableAttributes.push(observable);
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

},{"./tags/default":6}],6:[function(require,module,exports){
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
        for (i = 0; i < attributes.length; ++i) {
          monitorAttribute(attributes[i], shallowCopy, model);
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
module.exports.app = require('./lib/app');
module.exports.viewModel = require('./lib/binding/viewModel');

},{"./lib/app":2,"./lib/binding/viewModel":4}]},{},[1])
;