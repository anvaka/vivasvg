var BINDING_REGEX = /{{(.+?)}}/;
var eventify = require('ngraph.events');

module.exports = function (model) {
  var modelIsActive = typeof model.on === 'function';
  var on = modelIsActive ?
        function (eventName, cb) {
          model.on(eventName, cb);
        } : function () {};
  return {
    parse: function (expression) {
      var match = expression.match(BINDING_REGEX);
      if (!match) return; // no binding here;
      // todo: process all matches (e.g. {{x}}, {{y}})
      var modelPropertyPath = match[1].split('.');
      var provider;

      if (modelPropertyPath.length === 1) {
        provider = function () {
          return model[modelPropertyPath[0]];
        };
      } else {
        provider = function () {
          var localModel = model;
          for (var i = 0; i < modelPropertyPath.length; ++i) {
            localModel = localModel[modelPropertyPath[i]];
            if (!localModel) {
              return undefined;
            }
          }

          return localModel;
        };
      }

      var api = {
        provide: provider,
        on: on
      };

      return api;
    }
  };
};
