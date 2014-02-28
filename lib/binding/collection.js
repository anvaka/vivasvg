module.exports = Collection;

var eventify = require('ngraph.events');

// todo: optimize by GC
function Collection() {
  var source = [];
  var api = {
    push: function (item) {
      source.push(item);
      api.fire('changed', {
        action: 'add',
        added: [item]
      });
    }
  };

  eventify(api);

  return api;
}
