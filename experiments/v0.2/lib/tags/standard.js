var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  // Define optimized binding rules for circle:
  virtual.bindRule('cx', sizeRule('cx'));
  virtual.bindRule('cy', sizeRule('cy'));
  virtual.bindRule('r', sizeRule('r'));

  return function (model) {
    return {
      create: function () {
        var circle = virtual.domNode.cloneNode(false);
        virtual.bind(model, circle);
        return circle;
      }
    };
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
  itemsTag.bindRule('source', itemsSourceRule);

  return function itemsControl(model) {
    return {
      create: function () {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        itemsTag.bind(model, { g: g, template: itemsTag.children[0]});

        return g;
      }
    };
  };

  function itemsSourceRule(itemsControl) {
    return function (newValue) {
      for (var i = 0; i < newValue.length; ++i) {
        var child = itemsControl.template(newValue[i]).create();
        itemsControl.g.appendChild(child);
      }
    };
  }
});
