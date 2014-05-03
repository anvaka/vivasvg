require('./arrowTag');
var vivasvg = require('../../vivasvg');

var mousePos = require('./data/mousePos');
var dataContext = vivasvg.viewModel({
  arrows : createArrows(1000)
});

vivasvg.app(document.getElementById('scene'), dataContext);

renderFrame();

function renderFrame() {
  requestAnimationFrame(renderFrame);
  var arrows = dataContext.arrows;
  for (var i = 0; i < arrows.length; ++i) {
    arrows[i].move(mousePos);
    arrows[i].invalidate('from', 'to');
  }
}

function createArrows(n) {
  var ArrowModel = require('./data/arrowModel');

  var arrows = [];
  for (var i = 0; i < n; ++i) {
    var arrow = new ArrowModel();
    arrows.push(vivasvg.viewModel(arrow));
  }
  return arrows;
}
