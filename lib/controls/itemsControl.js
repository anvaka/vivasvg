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
  renderChildren(this);
  parentDom.appendChild(this._dom);
};

function renderChildren(itemsControl) {
  ensureItemsControlValid(itemsControl);

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

function ensureItemsControlValid(itemsControl) {
  if (itemsControl._markup && !itemsControl._itemSource) {
    var markup = itemsControl._markup;
    var source = markup.getAttributeNS(null, 'source');
    // todo: should be a better binding mechanism
    var replacer = require('../utils/bindingReplace')(itemsControl._dataContext);
    var match = source.match(/{{(.+?)}}/);
    if (match) {
      itemsControl.setItemSource(replacer(null, match[1]));
    }

    itemsControl.setItemTemplate(markup.innerHTML);
  }

  if (!itemsControl._itemSource || !itemsControl._itemTemplate) {
    throw new Error('Can not use items control without itemsSource and itemTemplate');
  }
}
