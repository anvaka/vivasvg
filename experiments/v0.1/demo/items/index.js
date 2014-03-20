var vivasvg = require('../../vivasvg');
var svgApp = vivasvg.createApp(document.getElementById('scene'), createViewModel(10));
svgApp.run();

function createViewModel(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    viewModels.push(
      vivasvg.viewModel({ x: Math.random() * 640, y: Math.random() * 480, dx: Math.random() * 10 - 5 , dy: Math.random() * 10 - 5 })
    );
  }

  return vivasvg.viewModel({circles: viewModels});
}
