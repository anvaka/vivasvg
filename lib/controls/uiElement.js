module.exports = UIElement;

function UIElement() {
  if (!(this instanceof UIElement)){
    return new UIElement();
  }

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

UIElement.prototype.removeChild = function (child) {
  if (this._children) {
    // whelps O(n). TODO: Need to be faster!
    var idx = this._children.indexOf(child);
    if (idx >= 0) {
      this._children.splice(idx, 1);
    }
  }
  child._dispose();
  if (child._dom && this._dom) {
    this._dom.removeChild(child._dom);
  }
};

UIElement.prototype.dataContext = function (context) {
  this._dataContext = context;
};

UIElement.prototype.getOwnerDocument = function () {
  return this._ownerDocument;
};

UIElement.prototype.markup = function (markup) {
  this._markup = markup;
};

UIElement.prototype.createElement = function (name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
};

UIElement.prototype._setParent = function (parent) {
  this._parent = parent;
  this._ownerDocument = parent._ownerDocument;
  this._inheritDataContext();
};

UIElement.prototype._appendToDom = function (dom) {
  if (this._dom) {
    dom.appendChild(this._dom);
  }
};

UIElement.prototype._dispose = function () {
  // we need to let each child deallocate resource
  // todo: bindings tracking/registration should not happen here
  if (this._bindings) { this._bindings.forEach(disposeBinding); }
  if (this._children) {
    this._children.forEach(disposeChild);
  }
};

UIElement.prototype._registerBinding = function (binding) {
  (this._bindings || (this._bindings = [])).push(binding);
};

UIElement.prototype._inheritDataContext = function () {
  if (!this._dataContext && this._parent) {
    // is this good enough, or there is a better way?
    this._dataContext = this._parent._dataContext;
  }
};

function renderChild(child) {
  child.render();
}

function disposeChild(child) {
  child._dispose();
}

function disposeBinding(binding) {
  binding.off(); // todo: this is not right, since it will kill all notifications
}
