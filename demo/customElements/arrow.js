var vivasvg = require('../../');
vivasvg.registerControl('arrow', Arrow);

var UIElement = vivasvg.UIElement;

function Arrow() {
  if (!(this instanceof Arrow)){
    return new Arrow();
  }

  UIElement.call(this);
}

Arrow.prototype = Object.create(UIElement.prototype);
Arrow.prototype.constructor = Arrow;

Arrow.prototype._appendToDom = function (parentDom) {
  this._dom = compileMarkup(this._markup, this._dataContext, this);
  parentDom.appendChild(this._dom);
};

function compileMarkup(markup, model, arrow) {
  // todo: looks like some of the code below should belong to UIElement
  addArrowTriangle(arrow);
  var path = vivasvg.svg('path');
  var bindingParser = vivasvg.bindingParser(model);

  var strokeValue = markup.getAttributeNS(null, 'stroke');
  var sourceBinding = bindingParser.parse(strokeValue);
  if (sourceBinding) {
    path.setAttributeNS(null, 'stroke', sourceBinding.provide());
  }

  var from = bindingParser.parse(markup.getAttributeNS(null, 'from'));
  var to = bindingParser.parse(markup.getAttributeNS(null, 'to'));
  if (from && to) {
    var source = from.provide();
    var dest = to.provide();

    from.on('changed', function () { renderPath(from.provide(), to.provide()); });
    to.on('changed', function () { renderPath(from.provide(), to.provide()); });

    renderPath(source, dest);
  }
  path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');

  return path;

  function renderPath(source, dest) {
    path.setAttributeNS(null, 'd', 'M' + source.x +',' + source.y + 'L' + dest.x + ',' + dest.y);
  }
}

function addArrowTriangle(arrow) {
  var ownerDocument = arrow.getOwnerDocument(arrow);
  if (ownerDocument && !ownerDocument.ArrowAugmented) {
    ownerDocument.addDef('<marker id="ArrowTriangle" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="5" orient="auto" style="fill: deepskyblue"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>');
    ownerDocument.ArrowAugmented = true; // todo: should be better way
  }
}
