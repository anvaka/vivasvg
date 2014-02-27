require('./arrow');

var dataContext = {
  from : {x: 10, y: 10},
  to: {x: 100, y: 100},
  color: 'deepskyblue'
};

var eventify = require('ngraph.events');
eventify(dataContext);

var vivasvg = require('../../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);

renderFrame();

function renderFrame() {
  requestAnimationFrame(renderFrame);

  var timer = Date.now() * 0.002;
  dataContext.from.x = 100 + Math.cos(timer) * 100;
  dataContext.from.y = 100 + Math.sin(timer) * 100;
  dataContext.fire('from');
}

