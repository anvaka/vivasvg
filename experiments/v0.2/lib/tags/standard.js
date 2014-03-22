var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  return function (model) {
    return {
      create: function () {
        var circle = virtual.domNode.cloneNode(false);

        virtual.bind('cx', model, function (x) { circle.cx.baseVal.value = x; });
        virtual.bind('cy', model, function (y) { circle.cy.baseVal.value = y; });
        virtual.bind('r', model, function (r) { circle.r.baseVal.value = r; });

        return circle;
      }
    };
  };
});

createTag('items', function (virtual){
  return function itemsControl(model) {
    return {
      create: function () {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var template = virtual.children[0];

        virtual.bind('source', model, function (newValue) {
          for (var i = 0; i < newValue.length; ++i) {
            var child = template(newValue[i]).create();
            g.appendChild(child);
          }
        });

        return g;
      }
    };
  };
});
