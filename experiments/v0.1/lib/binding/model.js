module.exports = model;

var eventify = require('ngraph.events');
function model(rawObject) {
  eventify(rawObject);
  return rawObject;
}

