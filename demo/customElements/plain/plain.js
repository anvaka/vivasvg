var mousePos = require('../data/mousePos');

var scene = document.getElementById('scene');
var svg = function (name) { return document.createElementNS('http://www.w3.org/2000/svg', name); };
var arrowsCount = 1000;
var arrows = createArrows(arrowsCount);

var g = svg('g');
scene.appendChild(g);

var points = arrows.map(function (arrow) {
  var path = svg('path');
  path.setAttributeNS(null, 'marker-end', 'url(#ArrowTriangle)');
  path.setAttributeNS(null, 'stroke', 'deepskyblue');
  g.appendChild(path);
  var source = arrow.from;
  var dest = arrow.to;

  var fromSeg = path.createSVGPathSegMovetoAbs(source.x, source.y);
  var toSeg = path.createSVGPathSegLinetoAbs(dest.x, dest.y);
  path.pathSegList.appendItem(fromSeg);
  path.pathSegList.appendItem(toSeg);
  return {
    model: arrow,
    source: source,
    dest: dest,
    fromSeg: fromSeg,
    toSeg: toSeg
  };
});

render();

function render() {
  requestAnimationFrame(render);
  points.forEach(move);
}

function move(point) {
  point.model.move(mousePos);
  point.fromSeg.x = point.source.x;
  point.fromSeg.y = point.source.y;
  point.toSeg.x = point.dest.x;
  point.toSeg.y = point.dest.y;
}

function createArrows(n) {
  var ArrowModel = require('../data/arrowModel');

  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    arrows.push(arrow);
  }

  return arrows;
}
