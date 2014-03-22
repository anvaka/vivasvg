# Idea

Each dom node maps to a custom object. E.g. consider an example:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <items source='{{circles}}'>
    <circle cx='{{x}}' cy='{{y}}' r='1'></circle>
  </items>
</svg>
```

Our compiler traverses the tree and finds constructor functions:

``` js
function svg() {}
function items() {}
function circle() {}
```

These functions create virtual DOM (thin wrappers other dom nodes), and provide extension
points for custom elements (e.g. `items`).

Each virtual dom element should have standard lifecycle:

* Append to dom.
* Remove from dom

For example, how can we implement `items()`?

``` js
createTag('items', function (itemsTag) {
  itemsTag.bindRule('source', itemsSourceRule);

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
```

21 lines and we have a prototype for `ng-repeat`-like tag.

[# Demo](https://anvaka.github.io/vivasvg/experiments/v0.2/demo/items/?q=1000)
