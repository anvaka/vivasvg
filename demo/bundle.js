;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var svg = require('../');

var dataContext = { points: createRandomPoints(10) };
var svgDoc = new svg.Document(document.body);
var contentControl = new svg.ContentControl([
    '<items source="{{points}}">',
      '<text x="{{x}}" y="{{y}}" fill="{{color}}">{{color}}</text>',
    '</items>'
  ].join('\n'), dataContext);

svgDoc.appendChild(contentControl);
svgDoc.render();

function createRandomPoints(count) {
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
}

},{"../":3,"./randomColors":2}],2:[function(require,module,exports){
module.exports = ["#8FBC8F","#EEE8AA","#DC143C","#8A2BE2","#C0C0C0","#00008B","#DDA0DD","#008080","#FF6347","#808000","#B0E0E6","#DEB887","#2F4F4F","#FF00FF","#FFEBCD","#F5FFFA","#CD5C5C","#191970","#4682B4","#E9967A","#A0522D","#800080","#2E8B57","#40E0D0","#FFEFD5","#FF1493","#FFFF00","#8B008B","#87CEEB","#483D8B","#5F9EA0","#4B0082","#98FB98","#6B8E23","#48D1CC","#556B2F","#BA55D3","#FAFAD2","#B22222","#8B0000","#F8F8FF","#FFFFF0","#FFC0CB","#D8BFD8","#F0F8FF","#00FFFF","#F0FFF0","#FF69B4","#FFF0F5","#FAF0E6","#000000","#00BFFF","#F5DEB3","#D3D3D3","#F08080","#FFDAB9","#EE82EE","#FDF5E6","#228B22","#FF7F50","#778899","#FFF8DC","#DB7093","#FFD700","#7FFFD4","#FAEBD7","#800000","#FF4500","#D2B48C","#6495ED","#FFA500","#E0FFFF","#FFFACD","#FFE4B5","#FFA07A","#9370DB","#4169E1","#9ACD32","#FFFAF0","#F0E68C","#00FF7F","#9932CC","#8B4513","#A52A2A","#000080","#DCDCDC","#9400D3","#FFFFE0","#008000","#FFE4E1","#CD853F","#FFFFFF","#F5F5DC","#696969","#00CED1","#87CEFA","#7B68EE","#ADD8E6","#E6E6FA","#808080","#D2691E","#00FFFF","#1E90FF","#20B2AA","#DA70D6","#FFB6C1","#B0C4DE","#3CB371","#708090","#B8860B","#0000FF","#ADFF2F","#BC8F8F","#DAA520","#00FF00","#FF8C00","#0000CD","#BDB76B","#C71585","#6A5ACD","#66CDAA","#AFEEEE","#FF00FF","#90EE90","#32CD32","#008B8B","#F0FFFF","#F5F5F5","#00FA9A","#FFDEAD","#7FFF00","#A9A9A9","#FFE4C4","#FA8072","#FF0000","#F4A460","#7CFC00","#006400","#FFF5EE","#FFFAFA"];

},{}],3:[function(require,module,exports){
module.exports = {
  Document: require('./lib/document'),
  Collection: require('./lib/collection'),
  ContentControl: require('./lib/contentControl')
};

},{"./lib/collection":5,"./lib/contentControl":6,"./lib/document":7}],4:[function(require,module,exports){
module.exports = function createBindReplacement(model) {
  return function bindingSubstitue(match, name) {
    var subtree = name.split('.');
    var localModel = model;

    for (var i = 0; i < subtree.length; ++i) {
      localModel = localModel[subtree[i]];
      // Attribute is not found on model. TODO: should we show warning?
      if (!localModel) return '';
    }

    return localModel;
  };
};

},{}],5:[function(require,module,exports){
module.exports = Collection;

var UIElement = require('./uiElement');

function Collection() {
  UIElement.call(this);
  this._dom = require('./svg')('g');
  this._initialized = false;
}

Collection.prototype = Object.create(UIElement.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.setItemTemplate = function (itemTemplate) {
  this._itemTemplate = itemTemplate;
  this._initialized = false;
};

Collection.prototype.setItemSource = function (itemSource) {
  this._itemSource = itemSource;
  this._initialized = false;
};

Collection.prototype.markupPrototype = function (markup) {
  var source = markup.getAttributeNS(null, 'source');
  // todo: should be a better binding mechanism
  var replacer = require('./bindingReplace')(this._dataContext);
  var match = source.match(/{{(.+?)}}/);
  if (match) {
    this.setItemSource(replacer(null, match[1]));
  }

  this.setItemTemplate(markup.innerHTML);
};

Collection.prototype.render = function () {
  if (!this._initialized) {
    this._initialize();
  }

  var children = this._children;
  for (var i = 0; i < children.length; ++i) {
    children[i].render();
  }
};

Collection.prototype._initialize = function () {
  if (!this._itemSource) return;

  var ContentControl = require('./contentControl');
  var nodePrototype = require('./domParser')(this._itemTemplate);

  var itemSource = this._itemSource;
  for (var i = 0; i < itemSource.length; ++i) {
    this.appendChild(new ContentControl(nodePrototype, itemSource[i]));
  }

  this._initialized = true;
};

},{"./bindingReplace":4,"./contentControl":6,"./domParser":8,"./svg":10,"./uiElement":11}],6:[function(require,module,exports){
module.exports = ContentControl;

var UIElement = require('./uiElement');
var extensions = require('./extensions')();

function ContentControl(protoNodes, model) {
  UIElement.call(this);

  if (typeof protoNodes === 'string') {
    protoNodes = require('./domParser')(protoNodes);
  }

  this._dom = compileProtoNodes(protoNodes, model, this);
}

ContentControl.prototype = Object.create(UIElement.prototype);
ContentControl.prototype.constructor = ContentControl;

function compileProtoNodes(nodes, model, logicalParent) {
  // TODO: group is not always required. E.g. when nodes length === 1, the node
  // itself should be returned
  var g = require('./svg')('g');
  var replacer = require('./bindingReplace')(model);

  compileSubtree(nodes, g);

  return g;

  function compileSubtree(nodes, visualParent) {
    for (var i = 0; i < nodes.length; ++i) {
      var protoNode = nodes[i];
      if (protoNode.localName in extensions) {
        // this is custom node, delegate its creation to handler
        var Ctor = extensions[protoNode.localName];
        var child = new Ctor();
        child.dataContext(model);
        child.markupPrototype(protoNode);
        logicalParent.appendChild(child, visualParent);
      } else {
        // regular svg, just add it to visual parent
        var cloneSubtree = protoNode.nodeType === 1; // text node
        var node = protoNode.cloneNode(cloneSubtree);
        bind(node, replacer);
        visualParent.appendChild(node);
        var children = protoNode.children;
        if (children && children.length > 0) {
          compileSubtree(children, node);
        }
      }
    }
  }
}

function bind(node, replacer) {
  var newValue;
  if (node.attributes) {
    for (var i = 0; i < node.attributes.length; ++i) {
      var attr = node.attributes[i];
      newValue = attr.nodeValue.replace(/{{(.+?)}}/, replacer);
      if (attr.nodeValue !== newValue) {
        node.setAttributeNS(attr.namespaceURI, attr.localName, newValue);
      }
    }
  }
  if (node.nodeType === 1) { // TEXT_NODE
    newValue = node.textContent.replace(/{{(.+?)}}/g, replacer);
    if (newValue !== node.textContent) {
      node.textContent = newValue;
    }
  }
}

},{"./bindingReplace":4,"./domParser":8,"./extensions":9,"./svg":10,"./uiElement":11}],7:[function(require,module,exports){
module.exports = Document;

var UIElement = require('./uiElement');

function Document(container) {
  UIElement.call(this);
  this._dom = require('./svg')('svg');
  container.appendChild(this._dom);
}

Document.prototype = Object.create(UIElement.prototype);
Document.prototype.constructor = Document;

},{"./svg":10,"./uiElement":11}],8:[function(require,module,exports){
var parser = new DOMParser();

module.exports = function (template) {
  // todo: error handling
  return parser.parseFromString('<g xmlns="http://www.w3.org/2000/svg">' + template + '</g>', 'text/xml').children[0].childNodes;
};

},{}],9:[function(require,module,exports){
module.exports = function () {
  return {
    'items': require('./collection')
  };
};

},{"./collection":5}],10:[function(require,module,exports){
var svgns = 'http://www.w3.org/2000/svg';

module.exports = function (elementName) {
  return document.createElementNS(svgns, elementName);
};

},{}],11:[function(require,module,exports){
module.exports = UIElement;

function UIElement() {
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

UIElement.prototype.markupPrototype = function (proto) {
}; // no-op

UIElement.prototype._setParent = function (parent) {
  this._parent = parent;
};

UIElement.prototype._appendToDom = function (dom) {
  if (this._dom) {
    dom.appendChild(this._dom);
  }
};

function renderChild(child) {
  child.render();
}

},{}]},{},[1])
;