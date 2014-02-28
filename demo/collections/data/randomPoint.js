var colors = require('./randomColors');

module.exports = function createRandomPoint() {
  return {
    x: Math.random() * 640,
    y: Math.random() * 480,
    color: colors[(Math.random() * colors.length) | 0]
  };
};
