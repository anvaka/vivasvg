var vivasvg = require('./vivasvg');

var bindingGroup = vivasvg.bindingGroup();
var models = createModels(4000);
var scene = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
document.body.appendChild(scene);

for (var i = 0; i < models.length; ++i) {
  var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttributeNS(null, '_cx', '{{x}}');
  circle.setAttributeNS(null, '_cy', '{{y}}');
  circle.setAttributeNS(null, 'r', '1');
  bindingGroup.bind(circle, models[i]);

  scene.appendChild(circle);
}

// Start animation loop (yes, outside of RAF, this is totally OK):
setInterval(function () {
  for (var i = 0; i < models.length; ++i) {
    model = models[i];
    model.x += model.dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += model.dx; }
    model.y += model.dy; if (model.y < 0 || model.y > 480 ) { model.dy *= -1; model.y += model.dy; }
    model.fire('x'); model.fire('y');
  }
  // fire() will mark all bindings which are using this model as `dirty`
  // and eventually, during RAF loop, will result in UI update
  // Note: Unlike angular, this needs to be explicit. We are focused on
  // performance here and cannot afford diff algorithm within 16ms. Also unlike
  // angular, use case with 4k dom elements is absolutely valid
}, 1000/60);


// normally this would be done by vivasvg internally. But we are in prototype
// phase here.
animate();
function animate() {
  requestAnimationFrame(animate);
  bindingGroup.updateTargets();
}

function createModels(count) {
  var models = [];
  for (var i = 0; i < count; ++i) {
    models.push(
      vivasvg.model({ x: Math.random() * 640, y: Math.random() * 480, dx: Math.random() * 10 - 5 , dy: Math.random() * 10 - 5 })
    );
  }
  return models;
}
