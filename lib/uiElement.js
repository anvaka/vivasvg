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
