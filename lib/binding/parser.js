var BINDING_REGEX = /{{(.+?)}}/g;
var eventify = require('ngraph.events');

module.exports = function (model) {
  var modelIsActive = typeof model.on === 'function';
  var on = modelIsActive ?
        function (eventName, cb) {
          model.on(eventName, cb);
        } : function () {};
  return {
    parse: function (expression) {
      var match = BINDING_REGEX.exec(expression);
      if (!match) return; // no binding here;

      var activeProperties;

      // do we have more binding expression?
      var moreMatches = BINDING_REGEX.exec(expression);
      var provider;
      if (moreMatches) {
        // todo: this can be made faster, e.g. remove regex
        // this is complex case of multiple binding expressions.
        // Find all bindings in the expression:
        var foundMatches = {};
        activeProperties = [];
        expression.replace(BINDING_REGEX, function (_, bindingMatch)  {
          var modelName = bindingMatch.split('.')[0];
          if (!foundMatches[modelName]) {
            activeProperties.push(modelName);
          }
          foundMatches[modelName] = 1;
        });
        provider = function () {
          return expression.replace(BINDING_REGEX, function (_, bindingMatch) {
            var modelPropertyPath = bindingMatch.split('.');
            var localModel = model;
            for (var i = 0; i < modelPropertyPath.length; ++i) {
              localModel = localModel[modelPropertyPath[i]];
              if (!localModel) {
                return undefined;
              }
            }

            return localModel;
          });
        };
      } else {
        var modelPropertyPath = match[1].split('.');
        activeProperties = [modelPropertyPath[0]];

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
      }


      var api = {
        provide: provider,
        on: on,
        activeProperties: activeProperties
      };

      return api;

    }
  };
};
