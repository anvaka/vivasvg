module.exports = function createRandomPoints(count) {
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
};
