module.exports = Collection;

var UIElement = require('./uiElement');
var compiler = require('./compiler');

function Collection() {
  UIElement.call(this);
  this._dom = require('./svg')('g');
  this._initialized = false;
}

Collection.prototype = Object.create(UIElement.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.setItemTemplate = function (itemTemplate) {
  this._createElement = compiler(itemTemplate);
  this._initialized = false;
};

Collection.prototype.setItemSource = function (itemSource) {
  this._itemSource = itemSource;
  this._initialized = false;
};

Collection.prototype.render = function () {
  if (!this._initialized) {
    this._initialize();
  }

  var children = this.children;
  for (var i = 0; i < children.length; ++i) {
    children[i].render();
  }
};

Collection.prototype._initialize = function () {
  var itemSource = this._itemSource || [];
  var createElement = this._createElement;

  this.children = [];
  for (var i = 0; i < itemSource.length; ++i) {
    this.appendChild(createElement(itemSource[i]));
  }

  this._initialized = true;
};

