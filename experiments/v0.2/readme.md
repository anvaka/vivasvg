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

* Append to dom
* Remove from dom

For example, how can we implement `items()`?

``` js
function items(virtualRoot) {
  var itemTemplate = virtualRoot.children[0]; // first element is an item template
  var attributes = virtualRoot.attrs;

  // this is our thin wrapper:
  return function (model) {
    return {
      appendTo: appendTo
    };

    function appendTo(parent) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      parent.appendChild(g);

      // listen to data items source changes:
      attributes.items.observe(model, {
        add: function (model) {
          // and add dom elements when source collection changed
          var child = itemTemplate(model);
          child.appendTo(g);
        }
      });
    }
  }
}
```

This may look a bit wordy, but it's only a prototype, 32 lines and we have `ng-repeat`-like tag
