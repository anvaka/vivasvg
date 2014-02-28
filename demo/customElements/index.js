require('./arrow');

var mousePos = require('./data/mousePos');
var dataContext = {
  arrows : createArrows(1000)
};

var vivasvg = require('../../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);

renderFrame();

function renderFrame() {
  requestAnimationFrame(renderFrame);
  var arrows = dataContext.arrows;
  for (var i = 0; i < arrows.length; ++i) {
    arrows[i].move(mousePos);
    arrows[i].fire('from');
  }
}

function createArrows(n) {
  var ArrowModel = require('./data/arrowModel');
  var eventify = require('ngraph.events');

  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    eventify(arrow);
    arrows.push(arrow);
  }
  return arrows;
}
