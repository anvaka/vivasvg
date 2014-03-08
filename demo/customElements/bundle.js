;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../');

vivasvg.createTag('arrow', {
  _appendToDom: function (parentDom) {
    this._dom = compileMarkup(this._markup, this._dataContext, this);
    parentDom.appendChild(this._dom);
  }
});

function compileMarkup(markup, model, arrow) {
  // todo: looks like some of the code below should belong to UIElement
  addArrowTriangle(arrow);

  var path = arrow.createElement('path');
  var bindingParser = vivasvg.bindingParser(model);

  var strokeValue = markup.getAttributeNS(null, 'stroke');
  var sourceBinding = bindingParser.parse(strokeValue);
  if (sourceBinding) {
    path.setAttributeNS(null, 'stroke', sourceBinding.provide());
  }

  var from = bindingParser.parse(markup.getAttributeNS(null, 'from'));
  var to = bindingParser.parse(markup.getAttributeNS(null, 'to'));
  var fromSeg, toSeg;
  if (from && to) {
    var source = from.provide();
    var dest = to.provide();

    from.on('from', onPositionPropertyChanged);
    to.on('to', onPositionPropertyChanged);

    fromSeg = path.createSVGPathSegMovetoAbs(source.x, source.y);
    toSeg = path.createSVGPathSegLinetoAbs(dest.x, dest.y);
    path.pathSegList.appendItem(fromSeg);
    path.pathSegList.appendItem(toSeg);
  }

  path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');

  return path;

  function onPositionPropertyChanged() {
    renderPath(from.provide(), to.provide());
  }

  function renderPath(source, dest) {
    fromSeg.x = source.x;
    fromSeg.y = source.y;
    toSeg.x = dest.x;
    toSeg.y = dest.y;
  }
}

function addArrowTriangle(arrow) {
  var ownerDocument = arrow.getOwnerDocument(arrow);
  if (ownerDocument && !ownerDocument.ArrowAugmented) {
    ownerDocument.addDef('<marker id="ArrowTriangle" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="5" orient="auto" style="fill: deepskyblue"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>');
    ownerDocument.ArrowAugmented = true; // todo: should be better way
  }
}

},{"../../":5}],2:[function(require,module,exports){
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
require('./arrow');

var mousePos = require('./data/mousePos');
var dataContext = {
  arrows : createArrows(1000)
};

var vivasvg = require('../../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);

renderFrame();

function renderFrame() {
  requestAnimationFrame(renderFrame);
  var arrows = dataContext.arrows;
  for (var i = 0; i < arrows.length; ++i) {
    arrows[i].move(mousePos);
    arrows[i].fire('from');
  }
}

function createArrows(n) {
  var ArrowModel = require('./data/arrowModel');
  var eventify = require('ngraph.events');

  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    eventify(arrow);
    arrows.push(arrow);
  }
  return arrows;
}

},{"../../":5,"./arrow":1,"./data/arrowModel":2,"./data/mousePos":3,"ngraph.events":20}],5:[function(require,module,exports){
module.exports = {
  // data binding related
  collection: require('./lib/binding/collection'),
  model: require('./lib/binding/model'),
  bindingParser: require('./lib/binding/parser'),

  bootstrap: require('./lib/bootstrap'),
  createTag: require('./lib/utils/createTag'),

  svg: require('./lib/utils/svg')
};

// augment with base controls
var controls = require('./lib/controls');
Object.keys(controls).forEach(exportControl);

function exportControl(name) {
  module.exports[name] = controls[name];
}

},{"./lib/binding/collection":6,"./lib/binding/model":8,"./lib/binding/parser":9,"./lib/bootstrap":10,"./lib/controls":13,"./lib/utils/createTag":17,"./lib/utils/svg":19}],6:[function(require,module,exports){
module.exports = collection;

var eventify = require('ngraph.events');

// todo: optimize by GC
function collection() {
  var source = [];
  var api = {
    length: 0,

    push: function (item) {
      source.push(item);
      this.length += 1;

      api.fire('changed', { added: [item] });
    },

    splice: function (idx, count) {
      var removed = source.splice(idx, count);
      this.length = source.length;
      api.fire('changed', { removed: removed, removeIdx: idx });
    },

    get : function (idx) {
      return source[idx];
    },

    forEach: function (callback, thisArg) {
      source.forEach(callback, thisArg);
    }
  };

  eventify(api);

  return api;
}

},{"ngraph.events":20}],7:[function(require,module,exports){
module.exports = function (element, bindingParser) {
  var binding;
  var attributes = element.attributes;
  if (attributes) {
    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      binding = bindingParser.parse(attr.nodeValue);
      if (binding) {
        element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
        var activeProperties = binding.activeProperties;
        var boundPropertiesCount = activeProperties.length;
        if (boundPropertiesCount === 1) {
          binding.on(activeProperties[0], onAttributeChanged(element, attr, binding));
        } else if (boundPropertiesCount > 1) {
          var propertyChanged = onAttributeChanged(element, attr, binding);
          for (var j = 0; j < boundPropertiesCount; ++j) {
            binding.on(activeProperties[j], propertyChanged);
          }
        }
      }
    }
  }

  if (element.nodeType === 3) { // TEXT_NODE
    binding = bindingParser.parse(element.nodeValue);
    if (binding) {
      element.nodeValue = binding.provide();
    }
  }

  return binding;
};

function onAttributeChanged(element, attr, binding) {
  return function () {
    element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
  };
}

},{}],8:[function(require,module,exports){
var eventify = require('ngraph.events');

module.exports = function (object) {
  return eventify(object);
};

},{"ngraph.events":20}],9:[function(require,module,exports){
var BINDING_REGEX = /{{(.+?)}}/g;
var eventify = require('ngraph.events');

module.exports = function (model) {
  var modelIsActive = typeof model.on === 'function';
  var on, off;
  if (modelIsActive) {
    on = model.on;
    off = model.off;
  } else {
    on = off = function () {};
  }

  return {
    parse: function (expression) {
      var match = BINDING_REGEX.exec(expression);
      if (!match) return; // no binding here;

      var activeProperties;

      // do we have more binding expression?
      var moreMatches = BINDING_REGEX.exec(expression);
      var provider;
      if (moreMatches) {
        // todo: this can be made faster, e.g. remove regex
        // this is complex case of multiple binding expressions.
        // Find all bindings in the expression:
        var foundMatches = {};
        activeProperties = [];
        expression.replace(BINDING_REGEX, function (_, bindingMatch)  {
          var modelName = bindingMatch.split('.')[0];
          if (!foundMatches[modelName]) {
            activeProperties.push(modelName);
          }
          foundMatches[modelName] = 1;
        });
        provider = function () {
          return expression.replace(BINDING_REGEX, function (_, bindingMatch) {
            var modelPropertyPath = bindingMatch.split('.');
            var localModel = model;
            for (var i = 0; i < modelPropertyPath.length; ++i) {
              localModel = localModel[modelPropertyPath[i]];
              if (!localModel) {
                return undefined;
              }
            }

            return localModel;
          });
        };
      } else {
        var modelPropertyPath = match[1].split('.');
        activeProperties = [modelPropertyPath[0]];

        if (modelPropertyPath.length === 1) {
          provider = function () {
            return model[modelPropertyPath[0]];
          };
        } else {
          provider = function () {
            var localModel = model;
            for (var i = 0; i < modelPropertyPath.length; ++i) {
              localModel = localModel[modelPropertyPath[i]];
              if (!localModel) {
                return undefined;
              }
            }

            return localModel;
          };
        }
      }


      var api = {
        provide: provider,
        activeProperties: activeProperties,
        on: on,
        off: off
      };

      return api;
    }
  };
};

},{"ngraph.events":20}],10:[function(require,module,exports){
module.exports = function (domRoot, dataContext) {
  var markup = domRoot.innerHTML;
  while (domRoot.firstChild) {
    domRoot.removeChild(domRoot.firstChild);
  }

  var svgDoc = require('./controls/document')(domRoot);
  svgDoc.dataContext(dataContext);

  var contentControl = require('./controls/contentControl')();
  contentControl.markup(markup);

  svgDoc.appendChild(contentControl);
  return svgDoc;
};

},{"./controls/contentControl":11,"./controls/document":12}],11:[function(require,module,exports){
var createTag = require('../utils/createTag');
var extensions = require('../extensions');

module.exports = createTag('content', {
  _appendToDom: function (parentDom) {
    compileMarkup(this, parentDom);
  }
});

function compileMarkup(contentControl, parentDom) {
  var nodes = contentControl._markup;
  var model = contentControl._dataContext;
  if (typeof nodes === 'string') {
    nodes = require('../utils/domParser')(nodes);
  }

  var bindingParser = require('../binding/parser')(model);
  var bindElement = require('../binding/element');

  // Trying to avoid extra dom elements when content control only has one child
  if (nodes.length === 1) {
    contentControl._dom = compileNode(nodes[0], parentDom);
  } else {
    var g = contentControl.createElement('g');
    compileSubtree(nodes, g);
    parentDom.appendChild(g);
    contentControl._dom = g;
  }

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      compileNode(nodes[i], visualParent);
    }
  }

  function compileNode(nodePrototype, visualParent) {
    var TagCtor = extensions.getTag(nodePrototype.localName);
    if (TagCtor) {
      // this is custom node, delegate its creation to handler
      var child = new TagCtor();
      child.markup(nodePrototype);
      contentControl.appendChild(child, visualParent);
      return child._dom;
    } else {
      // regular svg, just add it to visual parent
      var node = nodePrototype.cloneNode(false);
      var binding = bindElement(node, bindingParser);
      if (binding) {
        contentControl._registerBinding(binding);
      }

      visualParent.appendChild(node);
      var children = nodePrototype.childNodes;
      if (children && children.length > 0) {
        compileSubtree(children, node);
      }

      return node;
    }
  }
}

},{"../binding/element":7,"../binding/parser":9,"../extensions":16,"../utils/createTag":17,"../utils/domParser":18}],12:[function(require,module,exports){
module.exports = Document;

var UIElement = require('./uiElement');

function Document(container) {
  if (!(this instanceof Document)){
    return new Document(container);
  }

  UIElement.call(this);

  this._ownerDocument = this;

  if (container && container.localName === 'svg') {
    this._dom = container;
  } else {
    this._dom = require('../utils/svg')('svg');
    container.appendChild(this._dom);
  }
}

Document.prototype = Object.create(UIElement.prototype);
Document.prototype.constructor = Document;

Document.prototype.addDef = function (defsMarkup) {
  if (!defsMarkup) throw new Error('DefsMarkup is required argument for Document.addDef() method');

  var defs = getDefsElement(this._dom);
  var defContent = require('../utils/domParser')(defsMarkup);
  for (var i = 0; i < defContent.length; ++i) {
    defs.appendChild(defContent[i]);
  }
};

function getDefsElement(svgRoot) {
  var children = svgRoot.childNodes;
  for (var i = 0; i < children.length; ++i) {
    if (children[i].localName === 'defs') return children[i];
  }

  var defs = require('../utils/svg')('defs');
  svgRoot.appendChild(defs);
  return defs;
}

},{"../utils/domParser":18,"../utils/svg":19,"./uiElement":15}],13:[function(require,module,exports){
module.exports = {
  Document: require('./document'),
  ItemsControl: require('./itemsControl'),
  ContentControl: require('./contentControl'),
  UIElement: require('./uiElement')
};

},{"./contentControl":11,"./document":12,"./itemsControl":14,"./uiElement":15}],14:[function(require,module,exports){
var createTag = require('../utils/createTag');
var ContentControl = require('./contentControl');

module.exports = createTag('items', {
  setItemTemplate: function (itemTemplate) {
    this._itemTemplate = itemTemplate;
    this._nodePrototype = require('../utils/domParser')(itemTemplate);
  },

  setItemSource: function (itemSource) {
    // todo: what should we do when item source is already set?
    this._itemSource = itemSource;
    if (itemSource && typeof itemSource.on === 'function') {
      itemSource.on('changed',  handleCollectionChanged.bind(this));
    }
  },

  // override base methods:
  _appendToDom: function (parentDom) {
    this._dom = this.createElement('g');
    appendChildren(this);
    parentDom.appendChild(this._dom);
  },

  // private methods. TODO: move them out?
  _addItem: function (itemModel) {
    var contentControl = new ContentControl();
    // override default data context to current item:
    contentControl.dataContext(itemModel);
    contentControl.markup(this._nodePrototype);
    this.appendChild(contentControl);
  },

  _removeItems: function (from, count) {
    var removed = this._children.splice(from, count);
    var dom = this._dom;
    if (dom) {
      for (var i = 0; i < removed.length; ++i) {
        dom.removeChild(removed[i]._dom);
        removed[i]._dispose();
      }
    }
  }
});

function appendChildren(itemsControl) {
  ensureCanAppendChildren(itemsControl);

  var itemSource = itemsControl._itemSource;
  itemSource.forEach(itemsControl._addItem, itemsControl);
}

function ensureCanAppendChildren(itemsControl) {
  if (itemsControl._markup && !itemsControl._itemSource) {
    var markup = itemsControl._markup;
    var source = markup.getAttributeNS(null, 'source');
    var bindingParser = require('../binding/parser')(itemsControl._dataContext);
    var sourceBinding = bindingParser.parse(source);
    if (sourceBinding) {
      // todo: notifications?
      itemsControl.setItemSource(sourceBinding.provide());
    }

    itemsControl.setItemTemplate(markup.innerHTML);
  }

  if (!itemsControl._itemSource || !itemsControl._itemTemplate) {
    throw new Error('Can not use items control without itemsSource and itemTemplate');
  }
}

function handleCollectionChanged(changeEventArgs) {
  var i;
  var addedItems = changeEventArgs.added;
  if (addedItems) {
    for (i = 0; i < addedItems.length; ++i) {
      this._addItem(addedItems[i]);
    }
  }
  var removedItems = changeEventArgs.removed;
  if (removedItems) {
    var removeIdx = changeEventArgs.removeIdx || 0;
    this._removeItems(removeIdx, removedItems.length);
  }
}

},{"../binding/parser":9,"../utils/createTag":17,"../utils/domParser":18,"./contentControl":11}],15:[function(require,module,exports){
module.exports = UIElement;

function UIElement() {
  if (!(this instanceof UIElement)){
    return new UIElement();
  }

  this._children = null;
  this._parent = null;
}

UIElement.prototype.render = function () {
  if (this._children) {
    this._children.forEach(renderChild);
  }
};

UIElement.prototype.appendChild = function (child, visualParent) {
  (this._children || (this._children = [])).push(child);
  child._setParent(this);
  child._appendToDom(visualParent || this._dom);
};

UIElement.prototype.removeChild = function (child) {
  if (this._children) {
    // whelps O(n). TODO: Need to be faster!
    var idx = this._children.indexOf(child);
    if (idx >= 0) {
      this._children.splice(idx, 1);
    }
  }
  child._dispose();
  if (child._dom && this._dom) {
    this._dom.removeChild(child._dom);
  }
};

UIElement.prototype.dataContext = function (context) {
  this._dataContext = context;
};

UIElement.prototype.getOwnerDocument = function () {
  return this._ownerDocument;
};

UIElement.prototype.markup = function (markup) {
  this._markup = markup;
};

UIElement.prototype.createElement = function (name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
};

UIElement.prototype._setParent = function (parent) {
  this._parent = parent;
  this._ownerDocument = parent._ownerDocument;
  this._inheritDataContext();
};

UIElement.prototype._appendToDom = function (dom) {
  if (this._dom) {
    dom.appendChild(this._dom);
  }
};

UIElement.prototype._dispose = function () {
  // we need to let each child deallocate resource
  // todo: bindings tracking/registration should not happen here
  if (this._bindings) { this._bindings.forEach(disposeBinding); }
  if (this._children) {
    this._children.forEach(disposeChild);
  }
};

UIElement.prototype._registerBinding = function (binding) {
  (this._bindings || (this._bindings = [])).push(binding);
};

UIElement.prototype._inheritDataContext = function () {
  if (!this._dataContext && this._parent) {
    // is this good enough, or there is a better way?
    this._dataContext = this._parent._dataContext;
  }
};

function renderChild(child) {
  child.render();
}

function disposeChild(child) {
  child._dispose();
}

function disposeBinding(binding) {
  binding.off(); // todo: this is not right, since it will kill all notifications
}

},{}],16:[function(require,module,exports){
var registeredExtensions = {};

module.exports.register = function (name, ctor) {
  // todo: name collisions?
  registeredExtensions[name] = ctor;
};

module.exports.getTag = function (name) {
  return registeredExtensions[name];
};

},{}],17:[function(require,module,exports){
var UIElement = require('../controls/uiElement');
var extensions = require('../extensions');

var VALID_TAG_NAME = /^\w+$/;

module.exports = function (tagName, tagPrototype) {
  if (!VALID_TAG_NAME.test(tagName)) {
    throw new Error('tagName is expected to contain only word characters, but found: ' + tagName);
  }

  var functionBody = getFunctionTemplate(tagName);
  var ctor = (new Function('base', functionBody)(UIElement));

  ctor.prototype = Object.create(UIElement.prototype);
  ctor.prototype.constructor = ctor;

  Object.keys(tagPrototype).forEach(function (key) {
    ctor.prototype[key] = tagPrototype[key];
  });

  if (tagName) {
    extensions.register(tagName, ctor);
  }
  return ctor;
};

function getFunctionTemplate(tagName) {
  return ['return function ' + tagName + ' () {',
    'if (!(this instanceof ' + tagName +')){',
    '  return new ' + tagName + '();',
    '}',
    'base.call(this);',
  '}'].join('\n');
}

},{"../controls/uiElement":15,"../extensions":16}],18:[function(require,module,exports){
var parser = new DOMParser();

module.exports = function (template) {
  // todo: error handling
  return parser.parseFromString('<g xmlns="http://www.w3.org/2000/svg">' + template + '</g>', 'text/xml').children[0].children;
};

},{}],19:[function(require,module,exports){
var svgns = 'http://www.w3.org/2000/svg';

module.exports = function (elementName) {
  return document.createElementNS(svgns, elementName);
};

},{}],20:[function(require,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = {};

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      if (!registeredEvents.hasOwnProperty(eventName)) {
        registeredEvents[eventName] = [];
      }
      registeredEvents[eventName].push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = {};
        return subject;
      }

      if (registeredEvents.hasOwnProperty(eventName)) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var noEventsToFire = !registeredEvents.hasOwnProperty(eventName);
      if (noEventsToFire) {
        return subject; 
      }

      var callbacks = registeredEvents[eventName];
      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}]},{},[4])
;