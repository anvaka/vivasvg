module.exports = ArrowModel;

function ArrowModel() {
  this.from = {x: Math.random() * 640, y: Math.random() * 480};
  this.to = {x: Math.random() * 640, y: Math.random() * 480};
  this.color = 'deepskyblue';
  this.vx = -3 + Math.random() * 6;
  this.vy = -3 + Math.random() * 6;
  this.length = 10 + Math.random() * 10;
}

ArrowModel.prototype.move = function (target) {
  var x = this.from.x + this.vx;
  var y = this.from.y + this.vy;
  if (x < 0 || x > 640)  {
    this.vx *= -1;
    x = this.from.x + this.vx;
  }
  if (y < 0 || y > 480)  {
    this.vy *= -1;
    y = this.from.y + this.vy;
  }
  this.from.x = x;
  this.from.y = y;
  var x2 = target.x, y2 = target.y, x1 = this.from.x, y1 = this.from.y;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var mag = Math.sqrt(dx*dx + dy*dy);
  dx /= mag; dy /= mag;
  this.to.x = x1 + dx * this.length;
  this.to.y = y1 + dy * this.length;
};
