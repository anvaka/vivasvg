var points = createRandomPoints();

var svg = require('../');

var svgDoc = new svg.Document(document.body);
var collection = new svg.Collection();

collection.setItemTemplate('<rect x="{{x}}" y="{{y}}" fill="{{color}}" width="10px" height="10px"></rect>');
collection.setItemSource(points);
svgDoc.appendChild(collection);
svgDoc.render();

function createRandomPoints(count) {
  var colors = require('./randomColors');
  var points = [];
  for (var i = 0; i < count; ++i) {
    points.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      fill: colors[(Math.random() * colors.length) | 0]
    });
  }
  return points;
}
