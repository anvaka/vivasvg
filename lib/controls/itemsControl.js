module.exports = ItemsControl;

var ContentControl = require('./contentControl');
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
  this._nodePrototype = require('../utils/domParser')(itemTemplate);
};

ItemsControl.prototype.setItemSource = function (itemSource) {
  // todo: what should we do when item source is already set?
  this._itemSource = itemSource;
  if (itemSource && typeof itemSource.on === 'function') {
    itemSource.on('changed',  handleCollectionChanged.bind(this));
  }
};

ItemsControl.prototype._appendToDom = function (parentDom) {
  this._dom = require('../utils/svg')('g');
  appendChildren(this);
  parentDom.appendChild(this._dom);
};

ItemsControl.prototype._addItem = function (itemModel) {
  var contentControl = new ContentControl();
  // override default data context to current item:
  contentControl.dataContext(itemModel);
  contentControl.markup(this._nodePrototype);
  this.appendChild(contentControl);
};

function appendChildren(itemsControl) {
  ensureCanAppendChildren(itemsControl);

  var itemSource = itemsControl._itemSource;
  for (var i = 0; i < itemSource.length; ++i) {
    itemsControl._addItem(itemSource[i]);
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

function handleCollectionChanged(changeEventArgs) {
  var action = changeEventArgs.action;
  if (action === 'add') {
    var addedItems = changeEventArgs.added;
    if (addedItems) {
      for (var i = 0; i < addedItems.length; ++i) {
        this._addItem(addedItems[i]);
      }
    }
  }
}
