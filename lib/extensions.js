var registeredExtensions = {};

module.exports.register = function (name, ctor) {
  // todo: name collisions?
  registeredExtensions[name] = ctor;
};

module.exports.getTag = function (name) {
  return registeredExtensions[name];
};
