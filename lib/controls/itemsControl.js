module.exports = ItemsControl;

var UIElement = require('./uiElement');

function ItemsControl() {
  if (!(this instanceof ItemsControl)){
    return new ItemsControl();
  }

  UIElement.call(this);
  this._dom = require('../utils/svg')('g');
  this._initialized = false;
}

ItemsControl.prototype = Object.create(UIElement.prototype);
ItemsControl.prototype.constructor = ItemsControl;

ItemsControl.prototype.setItemTemplate = function (itemTemplate) {
  this._itemTemplate = itemTemplate;
  this._initialized = false;
};

ItemsControl.prototype.setItemSource = function (itemSource) {
  this._itemSource = itemSource;
  this._initialized = false;
};

ItemsControl.prototype.markupPrototype = function (markup) {
  var source = markup.getAttributeNS(null, 'source');
  // todo: should be a better binding mechanism
  var replacer = require('../utils/bindingReplace')(this._dataContext);
  var match = source.match(/{{(.+?)}}/);
  if (match) {
    this.setItemSource(replacer(null, match[1]));
  }

  this.setItemTemplate(markup.innerHTML);
};

ItemsControl.prototype.render = function () {
  if (!this._initialized) {
    this._initialize();
  }

  var children = this._children;
  for (var i = 0; i < children.length; ++i) {
    children[i].render();
  }
};

ItemsControl.prototype._initialize = function () {
  if (!this._itemSource) return;

  var ContentControl = require('./contentControl');
  var nodePrototype = require('../utils/domParser')(this._itemTemplate);

  var itemSource = this._itemSource;
  for (var i = 0; i < itemSource.length; ++i) {
    var contentControl = new ContentControl();
    contentControl.dataContext(itemSource[i]);
    contentControl.markupPrototype(nodePrototype);
    this.appendChild(contentControl);
  }

  this._initialized = true;
};
