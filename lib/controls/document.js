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
