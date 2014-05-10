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
  <circle _cx='{{x}}' _cy='{{y}}' r='10'></circle>
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
createTag('items', function (itemsTag) {
  // Let's define a new attribute for `items` tag:
  itemsTag.attribute('source', sourceAttributeChanged);
  itemsTag.template('<g></g>');

  function sourceAttributeChanged(items) {
    var itemTemplate = items.children[0]; // store into closure for quick access

    return function (sourceValue) {
      // we assume sourceValue is a collection
      for (var i = 0; i < sourceValue.length; ++i) {
        items.addChild(itemTemplate.create(sourceValue[i]));
      }
    };
  }
});
```

## Arrow

Arrows are not supported in SVG by default. To create a simple arrow in regular
SVG developers have to use `markers` and `defs`, this is how SVG works:


``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <path d='M 10 10 L 42 42' stroke='gray' marker-end='url(#Triangle)'></path>
  <defs>
    <marker id="Triangle"
            viewBox="0 0 10 10"
            refX="8" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="5"
            orient="auto" style="fill: gray">
      <path d="M 0 0 L 10 5 L 0 10 z"></path>
    </marker>
  </defs>
</svg>
```

This will render a simple arrow from point `(10, 10)` to `(42, 42)`. With vivasvg
you can create a tag to simplify it:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <arrow from='10 10' to='42 42' stroke='gray'></arrow>
</svg>
```

This is how `arrow` tag could be implemented:

``` js
vivasvg.createTag('arrow', function (arrowTag) {
  arrowTag.attribute('from', fromChanged);
  arrowTag.attribute('to', toChanged);
  arrowTag.attribute('stroke', strokeChanged);
  arrowTag.template('<path></path>');

  function fromChanged(arrow) {
    var fromSeg = arrow.dom.createSVGPathSegMovetoAbs(0, 0);
    arrow.dom.pathSegList.appendItem(fromSeg);

    return function (newValue) {
      fromSeg.x = newValue.x;
      fromSeg.y = newValue.y;
    };
  }

  function toChanged(arrow) {
    var toSeg = arrow.dom.createSVGPathSegLinetoAbs(0, 0);
    arrow.dom.pathSegList.appendItem(toSeg);

    return function (newValue) {
      toSeg.x = newValue.x;
      toSeg.y = newValue.y;
    };
  }

  function strokeChanged(arrow) {
    // stroke is interesting, since it requires corresponding `defs` in the svg root.
    // We will store registered markers in javascript map, to avoid calls to dom:
    var registeredMarkers = Object.create(null);
    var dom = arrow.dom;

    return function (newValue) {
      // assuming newValue will be a color.
      var defKey = registeredMarkers[newValue];
      // if color is not yet seen, register new def entry:
      if (!defKey) defKey = registerNewMarker(newValue);

      // finally set attributes on path itself:
      dom.setAttributeNS(null, 'stroke', newValue);
      dom.setAttributeNS(null, 'marker-end', 'url(#' + defKey + ')');
    };

    function registerNewMarker(color) {
      var id = 'triangle' + color;
      registeredMarkers[color] = id;

      // boring dom manipulation to create actual `defs > marker` tag
      var defs = getDefs(dom.ownerSVGElement);
      vivasvg.appendTo(defs, [
        '<marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth"',
        '        markerWidth="10" markerHeight="5" orient="auto"',
        '        style="fill: "' + color + '>',
        '  <path d="M 0 0 L 10 5 L 0 10 z"></path>',
        '</marker>'].join('\n');
    });

    function getDefs(svgRoot) {
      return svgRoot.getElementsByTagName('defs')[0] ||
             vivasvg.appendTo(svgRoot, '<defs></defs>');
    }
  }
});
```

This is a lot of code. It does solve complex problem though: SVG does not currently
support easier way of inheriting color for markers from referencing elements.
This [will be fixed in SVG 2.0](http://www.w3.org/TR/SVG2/painting.html#VertexMarkerProperties)
but now solution is too verbose.

Good news however, once developers have created this arrow tag, they can easily
share it with rest of the world via `npm`.

Tag libraries can be published as regular npm modules, and developers can consume
them via regular `require` call.
