var vivasvg = require('./vivasvg');

var model = vivasvg.model({ x: 42, y: 42, dx: 1, dy: 1 });

var svgDocument = vivasvg.Document(document.body);
svgDocument.dataContext(model);

var contentControl = vivasvg.ContentControl();
contentControl.markup('<circle cx="{{x}}" cy="{{y}}" r="1"></circle>');

svgDocument.appendChild(contentControl);
svgDocument.run();

// Start animation loop (yes, outside of RAF, this is totally OK):
setInterval(function () {
  model.x += dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += dx; }
  model.y += dy; if (model.y < 0 || model.y > 640 ) { model.dy *= -1; model.y += dy; }
  model.notify(); 
  // notify() will mark all bindings which are using this model as `dirty`
  // and eventually, during RAF loop, will result in UI update
  // Note: Unlike angular, notify needs to be explicit. We are focused on
  // performance here and cannot afford diff algorithm within 16ms. Also unlike
  // angular use case with 4k dom elements is absolutely valid
});
