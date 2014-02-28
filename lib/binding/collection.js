module.exports = Collection;

var eventify = require('ngraph.events');

// todo: optimize by GC
function Collection() {
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
    }
  };

  eventify(api);

  return api;
}
