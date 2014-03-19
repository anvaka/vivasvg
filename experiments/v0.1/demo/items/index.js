var vivasvg = require('../../vivasvg');

var viewModels = createViewModels(4000);
var svgApp = vivasvg.createApp(document.getElementById('scene'), {circles: viewModels});
svgApp.run();

function createViewModels(count) {
  var viewModels = [];
  for (var i = 0; i < count; ++i) {
    viewModels.push(
      vivasvg.viewModel({ x: Math.random() * 640, y: Math.random() * 480, dx: Math.random() * 10 - 5 , dy: Math.random() * 10 - 5 })
    );
  }
  return viewModels;
}
