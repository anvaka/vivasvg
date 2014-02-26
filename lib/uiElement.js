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

UIElement.prototype.appendChild = function (child) {
  (this._children || (this._children = [])).push(child);
  child._setParent(this);
  child._appendToDom(this._dom);
};

UIElement.prototype._setParent = function (parent) {
  this._parent = parent;
};

UIElement.prototype._appendToDom = function (dom) {
  this._dom = dom;
};

function renderChild(child) {
  child.render();
}
