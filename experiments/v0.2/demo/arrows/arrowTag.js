var vivasvg = require('../../vivasvg');

vivasvg.createTag('arrow', function (arrowTag) {
  arrowTag.attribute('from', fromRule);
  arrowTag.attribute('to', toRule);
  // TODO: how do I add defs?

  return {
    create: function (model) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');
      arrowTag.bind(model, path);
      return path;
    }
  };
});

function fromRule(arrowPath) {
  var fromSeg = arrowPath.createSVGPathSegMovetoAbs(0, 0);
  arrowPath.pathSegList.appendItem(fromSeg);
  return function (newValue) {
    fromSeg.x = newValue.x;
    fromSeg.y = newValue.y;
  };
}

function toRule(arrowPath) {
  var toSeg = arrowPath.createSVGPathSegLinetoAbs(0, 0);
  arrowPath.pathSegList.appendItem(toSeg);
  return function (newValue) {
    toSeg.x = newValue.x;
    toSeg.y = newValue.y;
  };
}
