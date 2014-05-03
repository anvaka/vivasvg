var mousePos = {x : 42, y: 42};

window.onmousemove = function (e) {
  e = e || window.event;
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
};

module.exports = mousePos;
