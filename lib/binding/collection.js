module.exports = collection;

var eventify = require('ngraph.events');

// todo: optimize by GC
function collection() {
  var source = [];
  var api = {
    length: 0,

    push: function (item) {
      source.push(item);
      this.length += 1;

      api.fire('changed', { added: [item] });
    },

    splice: function (idx, count) {
      var removed = source.splice(idx, count);
      this.length = source.length;
      api.fire('changed', { removed: removed, removeIdx: idx });
    },

    get : function (idx) {
      return source[idx];
    },

    forEach: function (callback) {
      source.forEach(callback);
    }
  };

  eventify(api);

  return api;
}
