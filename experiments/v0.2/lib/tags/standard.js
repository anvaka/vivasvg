var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  return function (model) {
    return {
      create: function () {
        var circle = virtual.domNode.cloneNode(false);
        var cx = virtual.attributes.cx;
        if (cx) {
          var acx = circle.cx.baseVal;
          cx.observe(model, function (newValue) { acx.value = newValue; });
        }
        var cy = virtual.attributes.cy;
        if (cy) {
          var acy = circle.cy.baseVal;
          cy.observe(model, function (newValue) { acy.value = newValue; });
        }
        return circle;
      }
    };
  };
});

createTag('items', function (virtual){
  return function (model) {
    return {
      create: function () {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var template = virtual.children[0];
        var itemsSource = virtual.attributes.source;

        itemsSource.observe(model, function (newValue) {
          for (var i = 0; i < newValue.length; ++i) {
            var model = newValue[i];
            g.appendChild(template(model).create());
          }
        });

        return g;
      }
    };
  };
});
