var vivasvg = require('../../vivasvg');
var countMatch = window.location.href.match(/q=(\d+)/);
var count = (countMatch && countMatch[1]) || 100;
var svgApp = vivasvg.app(document.getElementById('scene'), createViewModel(count));
svgApp.run();


function createViewModel(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    var xSpeed = Math.random() * 10 - 5;
    var color = Math.round(0.5 * xSpeed + 5);
    color = '#' + ((color << 32) + (color << 16) + color);
    var ball = {
      x: Math.random() * 640,
      y: Math.random() * 480,
      dx: xSpeed,
      dy: Math.random() * 10 - 5,
      fill: color
    };

    viewModels.push(vivasvg.viewModel(ball));
  }

  render();

  return vivasvg.viewModel({
    circles: viewModels
  });

  function render() {
    requestAnimationFrame(render);

    for (var i = 0; i < viewModels.length; ++i) {
      model = viewModels[i];
      model.x += model.dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += model.dx; }
      model.y += model.dy; if (model.y < 0 || model.y > 480 ) { model.dy *= -1; model.y += model.dy; }
      model.invalidate('x', 'y');
    }
  }
}
