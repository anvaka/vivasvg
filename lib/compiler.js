var ContentControl = require('./contentControl');
var parser = new DOMParser();

module.exports = function (template) {
  var protoNodes = parser.parseFromString('<g xmlns="http://www.w3.org/2000/svg">' + template + '</g>', 'text/xml').children[0].childNodes;

  return function (model) {
    return new ContentControl(protoNodes, model);
  };
};
