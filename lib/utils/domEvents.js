var prefix = '', addEventListener, removeEventListener;

// detect event model
if (typeof window !== 'undefined' && window.addEventListener) {
  addEventListener = 'addEventListener';
  removeEventListener = 'removeEventListener';
} else {
  addEventListener = 'attachEvent';
  removeEventListener = 'detachEvent';
  prefix = 'on';
}

module.exports.on = function (element, eventName, handler) {
  element[addEventListener](prefix + eventName, handler);
};

module.exports.off = function (element, eventName, handler) {
  element[removeEventListener](prefix + eventName, handler);
};
