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
