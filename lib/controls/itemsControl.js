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
