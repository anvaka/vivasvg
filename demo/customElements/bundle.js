;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('../../');
vivasvg.registerControl('arrow', Arrow);

var UIElement = vivasvg.UIElement;

function Arrow() {
  if (!(this instanceof Arrow)){
    return new Arrow();
  }

  UIElement.call(this);
}

Arrow.prototype = Object.create(UIElement.prototype);
Arrow.prototype.constructor = Arrow;

Arrow.prototype._appendToDom = function (parentDom) {
  this._dom = compileMarkup(this._markup, this._dataContext, this);
  parentDom.appendChild(this._dom);
};

function compileMarkup(markup, model, arrow) {
  // todo: looks like some of the code below should belong to UIElement
  addArrowTriangle(arrow);
  var path = vivasvg.svg('path');
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

    from.on('changed', function () { renderPath(from.provide(), to.provide()); });
    to.on('changed', function () { renderPath(from.provide(), to.provide()); });

    fromSeg = path.createSVGPathSegMovetoAbs(source.x, source.y);
    toSeg = path.createSVGPathSegLinetoAbs(dest.x, dest.y);
    path.pathSegList.appendItem(fromSeg);
    path.pathSegList.appendItem(toSeg);
  }
  path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');

  return path;

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

},{"../../":4}],2:[function(require,module,exports){
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
require('./arrow');

var ArrowModel = require('./data/arrowModel');

var eventify = require('ngraph.events');
var dataContext = {
  arrows : createArrows(1000)
};

var vivasvg = require('../../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);
var mousePos = {x : 42, y: 42};

window.onmousemove = function (e) {
  e = e || window.event;
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
};

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
  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    eventify(arrow);
    arrows.push(arrow);
  }
  return arrows;
}

},{"../../":4,"./arrow":1,"./data/arrowModel":2,"ngraph.events":16}],4:[function(require,module,exports){
module.exports = {
  svg: require('./lib/utils/svg'),
  bootstrap: require('./lib/bootstrap'),
  bindingParser: require('./lib/binding/parser'),
  registerControl: function (name, ctor) {
    // todo: name collisions?
    var extensions = require('./lib/extensions')();
    extensions[name] = ctor;
  }
};

var controls = require('./lib/controls');
Object.keys(controls).forEach(exportControl);

function exportControl(name) {
  module.exports[name] = controls[name];
}

},{"./lib/binding/parser":6,"./lib/bootstrap":7,"./lib/controls":10,"./lib/extensions":13,"./lib/utils/svg":15}],5:[function(require,module,exports){
module.exports = function (element, bindingParser) {
  var binding;
  var attributes = element.attributes;
  if (attributes) {
    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      binding = bindingParser.parse(attr.nodeValue);
      if (binding) {
        element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
      }
    }
  }
  if (element.nodeType === 3) { // TEXT_NODE
    binding = bindingParser.parse(element.nodeValue);
    if (binding) {
      element.nodeValue = binding.provide();
    }
  }
};

},{}],6:[function(require,module,exports){
var BINDING_REGEX = /{{(.+?)}}/;
var eventify = require('ngraph.events');

module.exports = function (model) {
  var modelIsActive = typeof model.on === 'function';

  return {
    parse: function (expression) {
      var match = expression.match(BINDING_REGEX);
      if (!match) return; // no binding here;
      // todo: process all matches (e.g. {{x}}, {{y}})
      var modelPropertyPath = match[1].split('.');
      var provider;

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

      var api = {
        provide: provider,
      };

      eventify(api);

      if (modelIsActive) {
        model.on(match[1], function () {
          api.fire('changed');
        });
      }

      return api;
    }
  };
};

},{"ngraph.events":16}],7:[function(require,module,exports){
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
  svgDoc.render();
};

},{"./controls/contentControl":8,"./controls/document":9}],8:[function(require,module,exports){
module.exports = ContentControl;

var UIElement = require('./uiElement');
var extensions = require('../extensions')();

function ContentControl() {
  if (!(this instanceof ContentControl)){
    return new ContentControl();
  }

  UIElement.call(this);
}

ContentControl.prototype = Object.create(UIElement.prototype);
ContentControl.prototype.constructor = ContentControl;

ContentControl.prototype._appendToDom = function (parentDom) {
  compileMarkup(this, parentDom);
};

function compileMarkup(contentControl, parentDom) {
  var nodes = contentControl._markup;
  var model = contentControl._dataContext;
  if (typeof nodes === 'string') {
    nodes = require('../utils/domParser')(nodes);
  }

  var bindingParser = require('../binding/parser')(model);
  var bindElement = require('../binding/element');

  // TODO: group is not always required. E.g. when nodes length === 1, the node
  // itself should be returned
  if (nodes.length === 1) {
    compileNode(nodes[0], parentDom);
  } else {
    var g = require('../utils/svg')('g');
    compileSubtree(nodes, g);
    parentDom.appendChild(g);
  }

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      compileNode(nodes[i], visualParent);
    }
  }

  function compileNode(nodePrototype, visualParent) {
    if (nodePrototype.localName in extensions) {
      // this is custom node, delegate its creation to handler
      var Ctor = extensions[nodePrototype.localName];
      var child = new Ctor();
      child.markup(nodePrototype);
      contentControl.appendChild(child, visualParent);
      return child._dom;
    } else {
      // regular svg, just add it to visual parent
      var node = nodePrototype.cloneNode(false);
      bindElement(node, bindingParser);

      visualParent.appendChild(node);
      var children = nodePrototype.childNodes;
      if (children && children.length > 0) {
        compileSubtree(children, node);
      }

      return visualParent;
    }
  }
}

},{"../binding/element":5,"../binding/parser":6,"../extensions":13,"../utils/domParser":14,"../utils/svg":15,"./uiElement":12}],9:[function(require,module,exports){
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
  for (var i = 0; children.length; ++i) {
    if (children[i].localName === 'defs') return children[i];
  }

  var defs = require('../utils/svg')('defs');
  svgRoot.appendChild(defs);
  return defs;
}

},{"../utils/domParser":14,"../utils/svg":15,"./uiElement":12}],10:[function(require,module,exports){
module.exports = {
  Document: require('./document'),
  ItemsControl: require('./itemsControl'),
  ContentControl: require('./contentControl'),
  UIElement: require('./uiElement')
};

},{"./contentControl":8,"./document":9,"./itemsControl":11,"./uiElement":12}],11:[function(require,module,exports){
module.exports = ItemsControl;

var UIElement = require('./uiElement');

function ItemsControl() {
  if (!(this instanceof ItemsControl)){
    return new ItemsControl();
  }

  UIElement.call(this);
}

ItemsControl.prototype = Object.create(UIElement.prototype);
ItemsControl.prototype.constructor = ItemsControl;

ItemsControl.prototype.setItemTemplate = function (itemTemplate) {
  this._itemTemplate = itemTemplate;
};

ItemsControl.prototype.setItemSource = function (itemSource) {
  this._itemSource = itemSource;
};

ItemsControl.prototype._appendToDom = function (parentDom) {
  this._dom = require('../utils/svg')('g');
  appendChildren(this);
  parentDom.appendChild(this._dom);
};

function appendChildren(itemsControl) {
  ensureCanAppendChildren(itemsControl);

  var ContentControl = require('./contentControl');
  var nodePrototype = require('../utils/domParser')(itemsControl._itemTemplate);

  var itemSource = itemsControl._itemSource;
  for (var i = 0; i < itemSource.length; ++i) {
    var contentControl = new ContentControl();
    // override default data context to current item:
    contentControl.dataContext(itemSource[i]);
    contentControl.markup(nodePrototype);
    itemsControl.appendChild(contentControl);
  }
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

},{"../binding/parser":6,"../utils/domParser":14,"../utils/svg":15,"./contentControl":8,"./uiElement":12}],12:[function(require,module,exports){
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

UIElement.prototype.dataContext = function (context) {
  this._dataContext = context;
};

UIElement.prototype.getOwnerDocument = function () {
  return this._ownerDocument;
};

UIElement.prototype.markup = function (markup) {
  this._markup = markup;
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

UIElement.prototype._inheritDataContext = function () {
  if (!this._dataContext && this._parent) {
    // is this good enough, or there is a better way?
    this._dataContext = this._parent._dataContext;
  }
};

function renderChild(child) {
  child.render();
}

},{}],13:[function(require,module,exports){
// I'm asking for troubles by exposing this, I know. Most likely will be changed
var registeredExtensions = {
  'items': require('./controls/itemsControl')
};

module.exports = function () {
  return registeredExtensions;
};

},{"./controls/itemsControl":11}],14:[function(require,module,exports){
var parser = new DOMParser();

module.exports = function (template) {
  // todo: error handling
  return parser.parseFromString('<g xmlns="http://www.w3.org/2000/svg">' + template + '</g>', 'text/xml').children[0].children;
};

},{}],15:[function(require,module,exports){
var svgns = 'http://www.w3.org/2000/svg';

module.exports = function (elementName) {
  return document.createElementNS(svgns, elementName);
};

},{}],16:[function(require,module,exports){
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
      var fireArguments = Array.prototype.splice.call(arguments, 1);
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

},{}]},{},[3])
;