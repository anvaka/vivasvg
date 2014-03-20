var vivasvg = require('../../vivasvg');
var svgApp = vivasvg.createApp(document.getElementById('scene'), createViewModel(4));
svgApp.run();


function createViewModel(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    viewModels.push(
      vivasvg.viewModel({ x: Math.random() * 640, y: Math.random() * 480, dx: Math.random() * 10 - 5 , dy: Math.random() * 10 - 5 })
    );
  }

  // Start animation loop (yes, outside of RAF, this is totally OK):
  setInterval(function () {
    for (var i = 0; i < viewModels.length; ++i) {
      model = viewModels[i];
      model.x += model.dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += model.dx; }
      model.y += model.dy; if (model.y < 0 || model.y > 480 ) { model.dy *= -1; model.y += model.dy; }
      model.invalidate('x', 'y');
    }
  }, 1000/60);

  return vivasvg.viewModel({
    groups: [vivasvg.viewModel({
      circles: viewModels
    })]
  });
}
