;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dataContext = {
  points: require('./randomPoints')(10)
};

var vivasvg = require('../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);

},{"../":4,"./randomPoints":3}],2:[function(require,module,exports){
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
  bootstrap: require('./lib/bootstrap')
};

var controls = require('./lib/controls');
Object.keys(controls).forEach(exportControl);

function exportControl(name) {
  module.exports[name] = controls[name];
}

},{"./lib/bootstrap":7,"./lib/controls":10}],5:[function(require,module,exports){
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
    debugger;
      element.nodeValue = binding.provide();
    }
  }
};

},{}],6:[function(require,module,exports){
var BINDING_REGEX = /{{(.+?)}}/;

module.exports = function (model) {

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

      return {
        provide: provider
      };
    }
  };
};

},{}],7:[function(require,module,exports){
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
  this._dom = compileMarkup(this._markup, this._dataContext, this);
  parentDom.appendChild(this._dom);
};

function compileMarkup(nodes, model, logicalParent) {
  if (typeof nodes === 'string') {
    nodes = require('../utils/domParser')(nodes);
  }

  var bindingParser = require('../binding/parser')(model);
  var bindElement = require('../binding/element');

  // TODO: group is not always required. E.g. when nodes length === 1, the node
  // itself should be returned
  var g = require('../utils/svg')('g');
  compileSubtree(nodes, g);

  return g;

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
      logicalParent.appendChild(child, visualParent);
    } else {
      // regular svg, just add it to visual parent
      var node = nodePrototype.cloneNode(false);
      bindElement(node, bindingParser);

      visualParent.appendChild(node);
      var children = nodePrototype.childNodes;
      if (children && children.length > 0) {
        compileSubtree(children, node);
      }
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

  if (container && container.localName === 'svg') {
    this._dom = container;
  } else {
    this._dom = require('../utils/svg')('svg');
    container.appendChild(this._dom);
  }
}

Document.prototype = Object.create(UIElement.prototype);
Document.prototype.constructor = Document;

},{"../utils/svg":15,"./uiElement":12}],10:[function(require,module,exports){
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
    // todo: should be a better binding mechanism
    var bindingParser = require('../binding/parser')(itemsControl._dataContext);
    var sourceBinding = bindingParser.parse(source);
    if (sourceBinding) {
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

UIElement.prototype.markup = function (markup) {
  this._markup = markup;
};

UIElement.prototype._setParent = function (parent) {
  this._parent = parent;
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
module.exports = function () {
  return {
    'items': require('./controls/itemsControl')
  };
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

},{}]},{},[1])
;