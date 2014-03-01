;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dataContext = {
  points: require('./randomPoints')(10)
};

var vivasvg = require('../../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);

},{"../../":4,"./randomPoints":3}],2:[function(require,module,exports){
module.exports = ["#8FBC8F","#EEE8AA","#DC143C","#8A2BE2","#C0C0C0","#00008B","#DDA0DD","#008080","#FF6347","#808000","#B0E0E6","#DEB887","#2F4F4F","#FF00FF","#FFEBCD","#F5FFFA","#CD5C5C","#191970","#4682B4","#E9967A","#A0522D","#800080","#2E8B57","#40E0D0","#FFEFD5","#FF1493","#FFFF00","#8B008B","#87CEEB","#483D8B","#5F9EA0","#4B0082","#98FB98","#6B8E23","#48D1CC","#556B2F","#BA55D3","#FAFAD2","#B22222","#8B0000","#F8F8FF","#FFFFF0","#FFC0CB","#D8BFD8","#F0F8FF","#00FFFF","#F0FFF0","#FF69B4","#FFF0F5","#FAF0E6","#000000","#00BFFF","#F5DEB3","#D3D3D3","#F08080","#FFDAB9","#EE82EE","#FDF5E6","#228B22","#FF7F50","#778899","#FFF8DC","#DB7093","#FFD700","#7FFFD4","#FAEBD7","#800000","#FF4500","#D2B48C","#6495ED","#FFA500","#E0FFFF","#FFFACD","#FFE4B5","#FFA07A","#9370DB","#4169E1","#9ACD32","#FFFAF0","#F0E68C","#00FF7F","#9932CC","#8B4513","#A52A2A","#000080","#DCDCDC","#9400D3","#FFFFE0","#008000","#FFE4E1","#CD853F","#FFFFFF","#F5F5DC","#696969","#00CED1","#87CEFA","#7B68EE","#ADD8E6","#E6E6FA","#808080","#D2691E","#00FFFF","#1E90FF","#20B2AA","#DA70D6","#FFB6C1","#B0C4DE","#3CB371","#708090","#B8860B","#0000FF","#ADFF2F","#BC8F8F","#DAA520","#00FF00","#FF8C00","#0000CD","#BDB76B","#C71585","#6A5ACD","#66CDAA","#AFEEEE","#FF00FF","#90EE90","#32CD32","#008B8B","#F0FFFF","#F5F5F5","#00FA9A","#FFDEAD","#7FFF00","#A9A9A9","#FFE4C4","#FA8072","#FF0000","#F4A460","#7CFC00","#006400","#FFF5EE","#FFFAFA"];

},{}],3:[function(require,module,exports){
module.exports = function createRandomPoints(count) {
  var colors = require('./randomColors');
  var points = [];
  for (var i = 0; i < count; ++i) {
    points.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      color: colors[(Math.random() * colors.length) | 0]
    });
  }
  return points;
};

},{"./randomColors":2}],4:[function(require,module,exports){
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

},{"./lib/binding/collection":5,"./lib/binding/model":7,"./lib/binding/parser":8,"./lib/bootstrap":9,"./lib/controls":12,"./lib/utils/createTag":16,"./lib/utils/svg":18}],5:[function(require,module,exports){
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

},{"ngraph.events":19}],6:[function(require,module,exports){
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
};

function onAttributeChanged(element, attr, binding) {
  return function () {
    element.setAttributeNS(attr.namespaceURI, attr.localName, binding.provide());
  };
}

},{}],7:[function(require,module,exports){
var eventify = require('ngraph.events');

module.exports = function (object) {
  return eventify(object);
};

},{"ngraph.events":19}],8:[function(require,module,exports){
var BINDING_REGEX = /{{(.+?)}}/g;
var eventify = require('ngraph.events');

module.exports = function (model) {
  var modelIsActive = typeof model.on === 'function';
  var on = modelIsActive ?
        function (eventName, cb) {
          model.on(eventName, cb);
        } : function () {};
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
        on: on,
        activeProperties: activeProperties
      };

      return api;
    }
  };
};

},{"ngraph.events":19}],9:[function(require,module,exports){
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

},{"./controls/contentControl":10,"./controls/document":11}],10:[function(require,module,exports){
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
      bindElement(node, bindingParser);

      visualParent.appendChild(node);
      var children = nodePrototype.childNodes;
      if (children && children.length > 0) {
        compileSubtree(children, node);
      }

      return node;
    }
  }
}

},{"../binding/element":6,"../binding/parser":8,"../extensions":15,"../utils/createTag":16,"../utils/domParser":17}],11:[function(require,module,exports){
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

},{"../utils/domParser":17,"../utils/svg":18,"./uiElement":14}],12:[function(require,module,exports){
module.exports = {
  Document: require('./document'),
  ItemsControl: require('./itemsControl'),
  ContentControl: require('./contentControl'),
  UIElement: require('./uiElement')
};

},{"./contentControl":10,"./document":11,"./itemsControl":13,"./uiElement":14}],13:[function(require,module,exports){
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

},{"../binding/parser":8,"../utils/createTag":16,"../utils/domParser":17,"./contentControl":10}],14:[function(require,module,exports){
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

UIElement.prototype._inheritDataContext = function () {
  if (!this._dataContext && this._parent) {
    // is this good enough, or there is a better way?
    this._dataContext = this._parent._dataContext;
  }
};

function renderChild(child) {
  child.render();
}

},{}],15:[function(require,module,exports){
var registeredExtensions = {};

module.exports.register = function (name, ctor) {
  // todo: name collisions?
  registeredExtensions[name] = ctor;
};

module.exports.getTag = function (name) {
  return registeredExtensions[name];
};

},{}],16:[function(require,module,exports){
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

},{"../controls/uiElement":14,"../extensions":15}],17:[function(require,module,exports){
var parser = new DOMParser();

module.exports = function (template) {
  // todo: error handling
  return parser.parseFromString('<g xmlns="http://www.w3.org/2000/svg">' + template + '</g>', 'text/xml').children[0].children;
};

},{}],18:[function(require,module,exports){
var svgns = 'http://www.w3.org/2000/svg';

module.exports = function (elementName) {
  return document.createElementNS(svgns, elementName);
};

},{}],19:[function(require,module,exports){
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

},{}]},{},[1])
;