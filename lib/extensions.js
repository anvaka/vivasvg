// I'm asking for troubles by exposing this, I know. Most likely will be changed
var registeredExtensions = {
  'items': require('./controls/itemsControl')
};

module.exports = function () {
  return registeredExtensions;
};
