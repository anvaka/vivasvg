;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vivasvg = require('./vivasvg');
// register 'standard' rules for binding:
vivasvg.makeBinding('circle', 'cx', function (ui, newValue) {
  ui.cx.baseVal.value = newValue;
});

vivasvg.makeBinding('circle', 'cy', function (ui, newValue) {
  ui.cy.baseVal.value = newValue;
});

var bindingGroup = vivasvg.bindingGroup();
var models = createModels(4000);
var scene = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
document.body.appendChild(scene);

for (var i = 0; i < models.length; ++i) {
  var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttributeNS(null, '_cx', '{{x}}');
  circle.setAttributeNS(null, '_cy', '{{y}}');
  circle.setAttributeNS(null, 'r', '1');
  bindingGroup.bind(circle, models[i]);

  scene.appendChild(circle);
}

// Start animation loop (yes, outside of RAF, this is totally OK):
setInterval(function () {
  for (var i = 0; i < models.length; ++i) {
    model = models[i];
    model.x += model.dx; if (model.x < 0 || model.x > 640 ) { model.dx *= -1; model.x += model.dx; }
    model.y += model.dy; if (model.y < 0 || model.y > 480 ) { model.dy *= -1; model.y += model.dy; }
    model.fire('x');
    model.fire('y');
  }
  // fire() will mark all bindings which are using this model as `dirty`
  // and eventually, during RAF loop, will result in UI update
  // Note: Unlike angular, this needs to be explicit. We are focused on
  // performance here and cannot afford diff algorithm within 16ms. Also unlike
  // angular, use case with 4k dom elements is absolutely valid
}, 1000/60);

bindingGroup.run();

function createModels(count) {
  var models = [];
  for (var i = 0; i < count; ++i) {
    models.push(
      vivasvg.model({ x: Math.random() * 640, y: Math.random() * 480, dx: Math.random() * 10 - 5 , dy: Math.random() * 10 - 5 })
    );
  }
  return models;
}

},{"./vivasvg":2}],2:[function(require,module,exports){
/**
 * Just an experimental binding provider
 */
module.exports.makeBinding = makeBinding;
module.exports.model = model;
module.exports.bindingGroup = bindingGroup;

var eventify = require('ngraph.events');
function model(rawObject) {
  eventify(rawObject);
  return rawObject;
}

function bindingGroup() {
  var dirtyBindings = [];
  var allBindings = []; // use this to dispose bindings.
  var dirtyLength = 0;

  return {
    run: run,
    bind: bind
  };

  function run() {
    requestAnimationFrame(run);
    if (dirtyLength) {
      updateTargets();
    }
  }

  function bind(target, source) {
    var attributes = target.attributes;
    var tagName = target.localName;
    var tagBindingRules = registeredBindings[tagName];
    var BINDING_EXPR = /{{(.+?)}}/;
    for (var i = 0; i < attributes.length; ++i) {
      var attr = attributes[i];
      var value = attr.value;
      var propertyMatch = value.match(BINDING_EXPR);
      if (!propertyMatch) continue;

      var propertyName = propertyMatch[1];
      var attrName = attr.localName;
      // Since SVG attribute values are very restrictive we cannot set them to
      // {{foo}}. Thus we allow to have "mirror" attribute names prefixed with _
      if (attrName[0] === '_') attrName = attrName.substr(1);
      var targetSetter = tagBindingRules[attrName];
      if (targetSetter) {
        allBindings.push(createBinding(targetSetter, propertyName, source, target));
      }
    }
  }

  function createBinding(setter, propertyName, model, target) {
    var binding = {
      isDirty: false,
      set : setter,
      target: target,
      source: function () { return model[propertyName]; } // todo: what if property has nested call? foo.x?
    };

    model.on(propertyName, function () {
      if (binding.isDirty) return; // already in the queue.
      binding.isDirty = true;
      dirtyBindings[dirtyLength++] = binding;
    });
  }

  function updateTargets() {
    for (var i = 0; i < dirtyLength; ++i) {
      var binding = dirtyBindings[i];
      binding.set(binding.target, binding.source());
      binding.isDirty = false;
    }

    dirtyLength = 0;
  }
}

var registeredBindings = Object.create(null);
function makeBinding(elementName, attrName, cb) {
  var elementBindings = registeredBindings[elementName];
  if (!elementBindings) {
    elementBindings = registeredBindings[elementName] = Object.create(null);
  }
  var attrBindings = elementBindings[attrName];
  if (!attrBindings) {
    elementBindings[attrName] = cb;
  } else {
    throw new Error('Element ' + elementName + ' already has registered binding for '  + attrName);
  }
}

},{"ngraph.events":3}],3:[function(require,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = {};

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      if (!registeredEvents.hasOwnProperty(eventName)) {
        registeredEvents[eventName] = [];
      }
      registeredEvents[eventName].push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = {};
        return subject;
      }

      if (registeredEvents.hasOwnProperty(eventName)) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var noEventsToFire = !registeredEvents.hasOwnProperty(eventName);
      if (noEventsToFire) {
        return subject; 
      }

      var callbacks = registeredEvents[eventName];
      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}]},{},[1])
;