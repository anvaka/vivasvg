var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  // Define optimized binding rules for circle:
  virtual.attribute('cx', sizeRule('cx'));
  virtual.attribute('cy', sizeRule('cy'));
  virtual.attribute('r', sizeRule('r'));

  return {
    create: function (model) {
      var circle = virtual.domNode.cloneNode(false);
      virtual.bind(model, circle);
      return circle;
    }
  };
});

/**
 * Creates optimized binding for SVGSize attribute
 */
function sizeRule (attr) {
  return function (element) {
    return function (newValue) {
      element[attr].baseVal.value = newValue;
    };
  };
}

createTag('items', function (itemsTag) {
  itemsTag.attribute('source', itemsSourceRule);

  return {
    create: function (model) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      itemsTag.bind(model, { g: g, template: itemsTag.children[0]});

      return g;
    }
  };

  function itemsSourceRule(itemsControl) {
    return function (newValue) {
      for (var i = 0; i < newValue.length; ++i) {
        var child = itemsControl.template.create(newValue[i]);
        itemsControl.g.appendChild(child);
      }
    };
  }
});
