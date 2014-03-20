;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');
var svgApp = vivasvg.createApp(document.getElementById('scene'), createViewModel(4));
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
    groups: [vivasvg.viewModel({
      circles: viewModels
    })]
  });
}

},{"../../vivasvg":9}],2:[function(require,module,exports){
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

var getTagRules = require('./bindingRule').getTagRules;
var BINDING_EXPR = /{{(.+?)}}/;

function bindingGroup() {
  var dirtyBindings = [];
  var dirtyLength = 0;

  return {
    bind: bind,
    updateTargets: updateTargets
  };

  function bind(target, viewModel) {
    var attributes = target.attributes;
    var tagBindingRules = getTagRules(target.localName);

    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      var value = attr.value;
      var propertyMatch = value.match(BINDING_EXPR);
      if (!propertyMatch) continue;

      var propertyName = propertyMatch[1];
      var attrName = attr.localName;
      // Since SVG attribute values are very restrictive we cannot set them to
      // {{foo}}. Thus we allow to have "mirror" attribute names prefixed with _
      if (attrName[0] === '_') attrName = attrName.substr(1);
      var targetSetter = tagBindingRules[attrName];
      if (targetSetter) {
        var setter = targetSetter(target);
        if (typeof setter !== 'function') throw new Error('Binding rule expected to return function. ' + target.localName + '[' + attrName + ']');
        createBinding(setter, propertyName, viewModel);
        viewModel.invalidate(propertyName);
      }
    }
  }

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

},{"./bindingRule":3}],3:[function(require,module,exports){
/**
 * This file defines a factory method for new binding rules. Each rule is applicable
 * based on tag name/attribute name pair.
 */
module.exports.bindingRule = bindingRule;
module.exports.getTagRules = getTagRules;

// This is a dictionary of all known bindings.
//   tagName => [attrName1, attrName2, ...]
//     attrName1 => function customSetter() {}
//     attrName2 => function customSetter() {}
// TODO: Add wildcard rules. E.g. * -> * -> element.setAttributeNS();
var knownBindings = Object.create(null);

function bindingRule(tagName, attrName, setter) {
  if (typeof setter !== 'function') {
    throw new Error('Setter is expected to be a function, found: ', setter);
  }

  var tagRules = knownBindings[tagName];
  if (!tagRules) {
    // tag rules contains binding rules for each attribute on this tag
    tagRules = knownBindings[tagName] = Object.create(null);
  }
  if (!tagRules[attrName]) {
    tagRules[attrName] = setter;
  } else {
    throw new Error('Element ' + tagName + ' already has registered binding for '  + attrName);
  }
}

function getTagRules(tagName) {
  return knownBindings[tagName];
}

},{}],4:[function(require,module,exports){
/**
 * This file contains optimized target setters for standard svg properties.
 *
 * Usually it is much faster to use property specific setters than generic
 * element.setAttributeNS() method.
 *
 * For example circle.cx.baseVal.value is ~2x faster than setAttributeNS(null, 'cx', x) api.
 */

var bindingRule = require('./bindingRule').bindingRule;

bindingRule('circle', 'cx', function (ui) {
  var baseVal = ui.cx.baseVal;
  return function (newValue) {
    baseVal.value = newValue;
  };
});

bindingRule('circle', 'cy', function (ui) {
  var baseVal = ui.cy.baseVal;
  return function (newValue) {
    baseVal.value = newValue;
  };
});

},{"./bindingRule":3}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var tagLib = Object.create(null);

module.exports.compile = compile;

module.exports.createTag = createTag;

function createTag(tagName, creator) {
  if (typeof creator !== 'function') {
    throw new Error('Tag ' + tagName + ' cannot be created since creator is not a function');
  }

  var registeredTag = tagLib[tagName];
  if (registeredTag) {
    throw new Error('Tag ' + tagName + ' already registered');
  } else {
    tagLib[tagName] = creator;
  }
}

function compile(root, bindingGroup) {
  var tag = tagLib[root.localName];
  var childLink;

  if (tag) {
    var dom = tag(root, nestedCompile);
    if (dom && root.parentElement) {
      root.parentElement.replaceChild(dom, root);
    }
  } else {
    var children = root.children;
    if (children.length) childLink = [];
    for (var i = 0; i < children.length; ++i) {
      childLink.push(compile(children[i], bindingGroup));
    }
  }

  return function (model) {
    if (childLink) {
      for (var i = 0; i < childLink.length; ++i) {
        childLink[i](model);
      }
    }

    bindingGroup.bind(root, model);
    return dom || root;
  };

  function nestedCompile(root) {
    return compile(root, bindingGroup);
  }
}

},{}],7:[function(require,module,exports){
var compiler = require('./compiler');
var binding = require('../binding/bindingRule');

compiler.createTag('items', function (tag, compile) {
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  var itemTemplate = tag.children[0];

  tag.api = {
    appendItem: function (model) {
      var child = itemTemplate.cloneNode(true);
      g.appendChild(compile(child)(model));
    }
  };

  return g;
});

binding.bindingRule('items', 'source', function (ui) {
  var itemsControl = ui.api;
  return function (newValue) {
    for (var i = 0; i < newValue.length; ++i) {
      itemsControl.appendItem(newValue[i]);
    }
  };
});

},{"../binding/bindingRule":3,"./compiler":6}],8:[function(require,module,exports){
module.exports = createApp;

var compiler = require('./compiler/compiler');

function createApp(dom, dataContext) {
  var bindingGroup = require('./binding/bindingGroup')();
  var link = compiler.compile(dom, bindingGroup);
  link(dataContext);

  return {
    run: run
  };

  function run() {
    requestAnimationFrame(run);
    bindingGroup.updateTargets();
  }
}

},{"./binding/bindingGroup":2,"./compiler/compiler":6}],9:[function(require,module,exports){
// make sure we have all our optimized binding rules setup:
require('./lib/binding/standardBindings');
require('./lib/compiler/standardTags');

/**
 * Expose binding rule factory for anyone to create new custom binding rules
 */
module.exports.bindingRule = require('./lib/binding/bindingRule').bindingRule;

/**
 * Let clients create new view models. Unlike angular, we require all view models
 * to share same interface. This makes use of the data sources somewhat
 * restrictive, but allows us to fine-tune performance at very low level.
 */
module.exports.viewModel = require('./lib/binding/viewModel');

// todo: do we need to expose this?
module.exports.bindingGroup = require('./lib/binding/bindingGroup');

module.exports.createApp = require('./lib/createApp');

},{"./lib/binding/bindingGroup":2,"./lib/binding/bindingRule":3,"./lib/binding/standardBindings":4,"./lib/binding/viewModel":5,"./lib/compiler/standardTags":7,"./lib/createApp":8}]},{},[1])
;