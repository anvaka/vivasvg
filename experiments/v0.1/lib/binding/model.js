module.exports = model;

function model(rawObject) {
  var boundProperties = Object.create(null);

  rawObject.bind = function (propertyName, changed) {
    var callbacks = boundProperties[propertyName];
    if (!callbacks) {
      callbacks = boundProperties[propertyName] = [];
    }
    callbacks.push(changed);
  };

  rawObject.invalidate = function () {
    for (var i = 0; i < arguments.length; ++i) {
      var propertyName = arguments[i];
      var callbacks = boundProperties[propertyName];
      for (var j = 0; j < callbacks.length; ++j) {
        callbacks[j](rawObject[propertyName]);
      }
    }
  };

  return rawObject;
}

