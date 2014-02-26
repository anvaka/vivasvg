module.exports = Document;

var UIElement = require('./uiElement');
var svgns = require('./svgns');

function Document(container) {
  UIElement.call(this);
  this._dom = document.createElementNS(svgns, 'svg');
  container.appendChild(this._dom);
}

Document.prototype = Object.create(UIElement.prototype);
Document.prototype.constructor = Document;
