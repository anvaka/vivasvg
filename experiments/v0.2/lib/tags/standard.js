var createTag = require('./index').createTag;

createTag('circle', function (virtual) {
  return function (model) {
    return {
      create: function () {
        var circle = virtual.domNode.cloneNode(false);

        debugger;
        virtual.bind('cx', model, function (newValue) { circle.cx.baseVal.value = newValue; });
        virtual.bind('cy', model, function (newValue) { circle.cy.baseVal.value = newValue; });

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

        debugger;
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
