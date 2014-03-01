var eventify = require('ngraph.events');

module.exports = function (object) {
  return eventify(object);
};
