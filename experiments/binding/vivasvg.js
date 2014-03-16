/**
 * Just an experimental binding provider
 */
module.exports.makeBinding = makeBinding;
module.exports.model = model;
module.exports.Document = Document;
module.exports.ContentControl = ContentControl;

function ContentControl() {

}

function Document(parent) {
  // todo: implement me
}

function model(rawObject) {
  // todo: wrap rawObejct into "active" event emitter
}

var registeredBindings = Object.create(null);
function makeBinding(elementName, attrName, cb) {
  var elementBindings = registeredBindings[elementName];
  if (!elementBindings) {
    registeredBindings[elementName] = Object.create(null);
  }
  var attrBindings = elementBindings[attrName];
  if (!attrBindings) {
    elementBindings[attrName] = cb;
  } else {
    throw new Error('Element ' + elementName + ' already has registered binding for '  + attrName);
  }
}
