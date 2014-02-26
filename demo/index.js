var svg = require('../');

var dataContext = { points: createRandomPoints(10) };
var svgDoc = new svg.Document(document.body);
var contentControl = new svg.ContentControl([
    '<items source="{{points}}">',
      '<text x="{{x}}" y="{{y}}" fill="{{color}}">{{color}}</text>',
    '</items>'
  ].join('\n'), dataContext);

svgDoc.appendChild(contentControl);
svgDoc.render();

function createRandomPoints(count) {
  var colors = require('./randomColors');
  var points = [];
  for (var i = 0; i < count; ++i) {
    points.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      color: colors[(Math.random() * colors.length) | 0]
    });
  }
  return points;
}
