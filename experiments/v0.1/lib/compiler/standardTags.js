var compiler = require('./compiler');
var binding = require('../binding/bindingRule');

compiler.createTag('items', function (tag, compile) {
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  var itemTemplate = tag.children[0];

  tag.api = {
    appendItem: function (model) {
      var child = itemTemplate.cloneNode(true);
      g.appendChild(compile(child)(model));
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
