# Starting over again.

I'm trying to work backwards and just creating an API, without implementation.
Let me know what you think about it.

Key features:

* Custom tags - Library should make custom tags creation extremely easy.
* Custom attributes - Library should make custom attributes creation easy.
* Binding - Support for binding expressions (binding to model/DOM/functions)
* Speed - render massive SVG scenes at performance rate not worse than if rendered
without library.

# Why not angular?

Angular has limit on upper number of objects in the application, and is not
supposed to reevaluate expressions every 12ms. There is an upper limit in the
browser too, as to how many SVG DOM nodes it can render at 60 fps. That limit is
much higher than what angular has.

Compare: [angular rendering of 1k](http://embed.plnkr.co/xZK8VSpzdCM2l06Sbma6/preview)
vs [native rendering of 1k](http://embed.plnkr.co/i9UBJoamLLpVMY4a1DCF/preview).

# Architecture overview

A compiler traverses the DOM tree and constructs a `virtual node` for each dom node.
Virtual node allows developers to create new tags and work with data-bound attributes.


# Examples

This is a collection of possible use cases. Keep in mind this is only a theory.

## Hello world

This is a simple hello world application

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <circle cx='{{x}}' cy='{{y}}' r='10'></circle>
</svg>
```

It will render a circle at `x`, `y` coordinates, which are coming from data context.
Data context is passed to vivasvg during application bootstrap:

``` js
  vivasvg.bootstrap(svgElement, {x: 42, y: 42});
```

## Items control

Items control allows developers to iterate over source colection and render with
a template:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <items source='{{circles}}'>
    <circle cx='{{x}}' cy='{{y}}' r='1'></circle>
  </items>
</svg>
```

`items` tag instantiates dom nodes for each element in the source collection.
Here is how it could be implemented:

``` js
createTag('items', function (virtualNode) {
  // Let's define a new attribute for `items` tag:
  virtualNode.attribute('source', sourceAttributeChanged);

  // Define method to create actual DOM node:
  virtualNode.create(createDOM);

  function createDOM(model) {
    // in svg `g` is a group of elements:
    return document.createElementNS('http://www.w3.org/2000/svg', 'g');
  }

  function sourceAttributeChanged(target, sourceValue) {
    var template = target.children[0];
    // we assume sourceValue is a collection
    for (var i = 0; i < sourceValue.length; ++i) {
      target.addChild(template.create(sourceValue[i]));
    }
  }
});
```
