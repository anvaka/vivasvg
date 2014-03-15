function createItems(qs) {
  var countMatch = qs.match(/n=(\d+)/);
  var count;
  if (countMatch) {
    count = parseInt(countMatch[1], 10);
  }
  count = count || 4000;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var points = [];
  for ( var i = 0; i < count; ++i) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'r', 1);
    var pt = {
      x: circle.cx.baseVal,
      y: circle.cy.baseVal,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      circle: circle
    };
    pt.x.value = Math.random() * 640;
    pt.y.value = Math.random() * 480;
    points.push(pt);
    svg.appendChild(circle);
  }

  document.body.appendChild(svg);
  return points;
}

function animateItems(points) {
  for (var i = 0; i < points.length; ++i) {
    var pt = points[i];
    var x = pt.x.value + pt.dx;
    if (x < 0 || x > 640) {
      pt.dx *= -1;
      x += pt.dx;
    }
    var y = pt.y.value + pt.dy;
    if (y < 0 || y > 480) {
      pt.dy *= -1;
      y += pt.dy;
    }
    pt.x.value = x;
    pt.y.value = y;
  }
}
