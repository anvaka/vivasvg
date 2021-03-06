# Idea

Each dom node maps to a custom object. E.g. consider an example:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <items source='{{circles}}'>
    <circle cx='{{x}}' cy='{{y}}' r='1'></circle>
  </items>
</svg>
```

Our compiler traverses the tree and for each node constructs a `virtual node`.
Virtual node allows developers to create new tags and work with data-bound attributes.

`items` tag instantiates dom nodes for each element in the source collection. Here is how it can be implemented:

``` js
createTag('items', function (virtualNode) {
  // virtualNode allows developers to react on dom attributes.
  // We want to update our dom children, based on `source` attribute:
  virtualNode.attribute('source', itemsSourceAttr);

  return {
    // this method creates new instance of real dom node, with desired behavior:
    create: function (model) {
      // in svg `g` is a group of elements:
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // now we tell context to bind to a model. Second argument is passed to itemsSourceAttr
      virtualNode.bind(model, {
        g: g,
        template: virtualnode.children[0] // virtualnode gives us access to child
      });

      return g;
    }
  };

  function itemsSourceAttr(itemsControl) {
    // itemsControl is a second argument from context.bind(). See above.

    return function (newValue) {
      // this function will be called when source value is changed. Assuming
      // it's a collection let's iterate over each element, and construct dom nodes:
      for (var i = 0; i < newValue.length; ++i) {
        var child = itemsControl.template.create(newValue[i]);
        itemsControl.g.appendChild(child);
      }
    };
  }
});
```

[# Demo](https://anvaka.github.io/vivasvg/experiments/v0.2/demo/items/?q=1000)
