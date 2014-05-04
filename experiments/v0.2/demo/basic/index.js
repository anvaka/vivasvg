var vivasvg = require('../../vivasvg');

var dataContext = vivasvg.viewModel({x: 320, y: 240});
var app = vivasvg.app(document.getElementById('scene'), dataContext);

setInterval(function () {
  dataContext.x += Math.random() * 8 - 4;
  dataContext.y += Math.random() * 8 - 4;
  dataContext.invalidate('x', 'y');
}, 1000/60);
