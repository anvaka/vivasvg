var compiler = require('./compiler');
var binding = require('../binding/bindingRule');

compiler.createTag('items', function (tag) {
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  var itemTemplate = tag.children[0];

  tag.api = {
    appendItem: function (model) {
      var child = itemTemplate.clone(true);
      g.appendChild(child);
    }
  };

  return g;
});

binding.bindingRule('items', 'source', function (ui) {
  var itemsControl = ui.api;
  return function (newValue) {
    for (var i = 0; i < newValue.length; ++i) {
      itemsControl.appendItem(newValue[i]);
    }
  };
});
