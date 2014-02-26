module.exports = Document;

var UIElement = require('./uiElement');

function Document(container) {
  UIElement.call(this);
  this._dom = require('./svg')('svg');
  container.appendChild(this._dom);
}

Document.prototype = Object.create(UIElement.prototype);
Document.prototype.constructor = Document;
