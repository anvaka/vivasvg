(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../vivasvg');

vivasvg.createTag('arrow', function (arrowTag) {
  arrowTag.attribute('from', fromRule);
  arrowTag.attribute('to', toRule);
  arrowTag.attribute('stroke', strokeRule);

  return {
    create: function (model) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');
      arrowTag.bind(model, path);
      return path;
    }
  };
});

function fromRule(arrowPath) {
  var fromSeg = arrowPath.createSVGPathSegMovetoAbs(0, 0);
  arrowPath.pathSegList.appendItem(fromSeg);
  return function (newValue) {
    fromSeg.x = newValue.x;
    fromSeg.y = newValue.y;
  };
}

function toRule(arrowPath) {
  var toSeg = arrowPath.createSVGPathSegLinetoAbs(0, 0);
  arrowPath.pathSegList.appendItem(toSeg);
  return function (newValue) {
    toSeg.x = newValue.x;
    toSeg.y = newValue.y;
  };
}

function strokeRule(arrowPath) {
  return function (newValue) {
    debugger;
    ensureArrowDefRegistered(arrowPath, newValue);
    arrowPath.setAttributeNS(null, 'stroke', newValue);
  };
}

function ensureArrowDefRegistered(path, color) {
  // we need to add defs to the svg root
  var ownerDocument = path.ownerSVGElement;
  var defId = 'ArrowTriangle' + color;
  if (ownerDocument && !ownerDocument[defId]) {
    ownerDocument.addDef('<marker id="' + defId + '" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="5" orient="auto" style="fill: ' + color + '"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>');
    ownerDocument[defId] = true; // todo: should be better way
  }
}

},{"../../vivasvg":13}],2:[function(require,module,exports){
module.exports = ArrowModel;

function ArrowModel() {
  this.from = {x: Math.random() * 640, y: Math.random() * 480};
  this.to = {x: Math.random() * 640, y: Math.random() * 480};
  this.color = 'deepskyblue';
  this.vx = -3 + Math.random() * 6;
  this.vy = -3 + Math.random() * 6;
  this.length = 10 + Math.random() * 10;
}

ArrowModel.prototype.move = function (target) {
  var x = this.from.x + this.vx;
  var y = this.from.y + this.vy;
  if (x < 0 || x > 640)  {
    this.vx *= -1;
    x = this.from.x + this.vx;
  }
  if (y < 0 || y > 480)  {
    this.vy *= -1;
    y = this.from.y + this.vy;
  }
  this.from.x = x;
  this.from.y = y;
  var x2 = target.x, y2 = target.y, x1 = this.from.x, y1 = this.from.y;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var mag = Math.sqrt(dx*dx + dy*dy);
  dx /= mag; dy /= mag;
  this.to.x = x1 + dx * this.length;
  this.to.y = y1 + dy * this.length;
};

},{}],3:[function(require,module,exports){
var mousePos = {x : 42, y: 42};

window.onmousemove = function (e) {
  e = e || window.event;
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
};

module.exports = mousePos;

},{}],4:[function(require,module,exports){
require('./arrowTag');
var vivasvg = require('../../vivasvg');

var mousePos = require('./data/mousePos');
var dataContext = vivasvg.viewModel({
  arrows : createArrows(1000)
});

vivasvg.app(document.getElementById('scene'), dataContext);

renderFrame();

function renderFrame() {
  requestAnimationFrame(renderFrame);
  var arrows = dataContext.arrows;
  for (var i = 0; i < arrows.length; ++i) {
    arrows[i].move(mousePos);
    arrows[i].invalidate('from', 'to');
  }
}

function createArrows(n) {
  var ArrowModel = require('./data/arrowModel');

  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    arrows.push(vivasvg.viewModel(arrow));
  }
  return arrows;
}

},{"../../vivasvg":13,"./arrowTag":1,"./data/arrowModel":2,"./data/mousePos":3}],5:[function(require,module,exports){
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

},{"./binding/bindingGroup":6,"./compile/compile":8}],6:[function(require,module,exports){
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

function bindingGroup() {
  return {
    createBinding: createBinding,
  };

  function createBinding(propertyName, viewModel, setter) {
    viewModel.bind(propertyName, setter);
    viewModel.invalidate(propertyName);
  }
}

},{}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){
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


},{"../tags/":11,"./virtualNode":9}],9:[function(require,module,exports){
/**
 * Each dom element gets a special 'virtual node' assigned to it. This helps
 * custom tags to bind to data model, and inspect its own children
 */

module.exports = virtualNode;

var BINDING_EXPR = /{{(.+?)}}/;

function virtualNode(domNode, virtualChildren, bindingGroup) {
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

    bindingGroup.createBinding(modelNameMatch[1], model, valueChanged);
  }
}

function universalRule(element, attrName) {
  return function (newValue) {
    element.setAttributeNS(null, attrName, newValue);
  };
}

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./default":10}],12:[function(require,module,exports){
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

},{"./index":11}],13:[function(require,module,exports){
require('./lib/tags/standard');

module.exports.app = require('./lib/app');
module.exports.viewModel = require('./lib/binding/viewModel');
module.exports.createTag = require('./lib/tags/').createTag;

},{"./lib/app":5,"./lib/binding/viewModel":7,"./lib/tags/":11,"./lib/tags/standard":12}]},{},[4])