;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = ArrowModel;

function ArrowModel() {
  this.from = {x: Math.random() * 640, y: Math.random() * 480};
  this.to = {x: Math.random() * 640, y: Math.random() * 480};
  this.color = 'deepskyblue';
  this.vx = -3 + Math.random() * 6;
  this.vy = -3 + Math.random() * 6;
  this.length = 10 + Math.random() * 10;
}

ArrowModel.prototype.move = function (target) {
  var x = this.from.x + this.vx;
  var y = this.from.y + this.vy;
  if (x < 0 || x > 640)  {
    this.vx *= -1;
    x = this.from.x + this.vx;
  }
  if (y < 0 || y > 480)  {
    this.vy *= -1;
    y = this.from.y + this.vy;
  }
  this.from.x = x;
  this.from.y = y;
  var x2 = target.x, y2 = target.y, x1 = this.from.x, y1 = this.from.y;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var mag = Math.sqrt(dx*dx + dy*dy);
  dx /= mag; dy /= mag;
  this.to.x = x1 + dx * this.length;
  this.to.y = y1 + dy * this.length;
};

},{}],2:[function(require,module,exports){
var mousePos = {x : 42, y: 42};

window.onmousemove = function (e) {
  e = e || window.event;
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
};

module.exports = mousePos;

},{}],3:[function(require,module,exports){
var mousePos = require('./data/mousePos');

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
  var ArrowModel = require('./data/arrowModel');

  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    arrows.push(arrow);
  }

  return arrows;
}

},{"./data/arrowModel":1,"./data/mousePos":2}]},{},[3])
;