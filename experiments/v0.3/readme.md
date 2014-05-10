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

## SVG component

Library allows you to reuse complex SVG markup in just one tag:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <tiger></tiger>
</svg>
```

This code should render a famous [svg tiger](http://commons.wikimedia.org/wiki/File:Ghostscript_Tiger.svg).
This is how the `tiger` tag is created:

``` js
var createTag = require('vivasvg').createTag;
var tigerMarkup = require('fs').readFileSync('./tiger.svg', 'utf8');
createTag('tiger', tigerMarkup);
```

`createTag` registers a new tag `tiger`, and provides a markup which will replace
original tag.

Let's add support to change fill color:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <tiger fill='orange'></tiger>
  <tiger fill='deepskyblue'></tiger>
</svg>
```

To accomplish this goal, we can provide a custom function to generate markup:

``` js
createTag('tiger', function(tag) {
  var markup = require('fs').readFileSync('./tiger.svg', 'utf8');
  var customFill = tag.attributes('fill');

  if (customFill) markup.replace(/#cc7226/g, customFill);

  // provide new template with replaced color
  tag.template(markup);
});
```

## Items source

Items source allows developers to generate repeatable content. E.g. this:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <g items-source='[{x: 1, y: 1}, {x: 2, y: 2}]'>
    <circle cx='{{x}}' cy='{{y}}' r='1'></circle>
  </g>
</svg>
```

Is transformed to this:

``` html
<svg xmlns='http://www.w3.org/2000/svg'>
  <g>
    <circle cx='1' cy='1' r='1'></circle>
    <circle cx='2' cy='2' r='1'></circle>
  </g>
</svg>
```

`items-source` attribute adds new behavior to standard `g` tag. For each item in the
underlying model collection it instantiates a new DOM element:

``` js
createAttribute('items-source', function (tag) {
  // grab content of a tag and treat it as item template:
  var itemTemplate = tag.children();
  tag.empty();

  return function changedCallback(sourceValue) {
    // we assume sourceValue is a collection
    for (var i = 0; i < sourceValue.length; ++i) {
      var child = itemTemplate.clone(sourceValue[i]);
      tag.addChild(child);
    }
  };
});
```

## Arrow

Arrows are not supported in SVG by default. To create a simple arrow in regular
SVG developers have to use `markers` and `defs`:

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
  <arrow from='{x: 10, y: 10}' to='{x: 42, y: 42}' stroke='gray'></arrow>
</svg>
```

This is how `arrow` tag could be implemented:

``` js
createTag('arrow', '<path></path>');

// create new attributes and limit their scope to `arrow` tag only:
createAttribute('arrow', 'from', function (tag) {
  // using SVG javascript api instead of DOM api is much faster:
  var fromSeg = tag.dom.createSVGPathSegMovetoAbs(0, 0);
  tag.dom.pathSegList.appendItem(fromSeg);

  return function (newValue) {
    fromSeg.x = newValue.x;
    fromSeg.y = newValue.y;
  };
});

createAttribute('arrow', 'to', function (tag) {
  var toSeg = tag.dom.createSVGPathSegLinetoAbs(0, 0);
  tag.dom.pathSegList.appendItem(toSeg);

  return function (newValue) {
    toSeg.x = newValue.x;
    toSeg.y = newValue.y;
  };
});

// stroke is interesting, since it requires to update `defs` on the svg root.
createAttribute('arrow', 'stroke', function (tag) {
  // We will store registered markers in javascript map, to avoid calls to dom:
  var registeredMarkers = Object.create(null);
  var dom = tag.dom;

  return function (newColor) {
    var defKey = registeredMarkers[newColor];
    // if color is not yet seen, register new def entry:
    if (!defKey) defKey = registerNewMarker(newColor);

    // finally set attributes on path itself:
    dom.setAttributeNS(null, 'stroke', newColor);
    dom.setAttributeNS(null, 'marker-end', 'url(#' + defKey + ')');
  };

  // boring dom manipulation to create actual `defs > marker` tag
  function registerNewMarker(color) {
    var id = 'triangle' + color;
    registeredMarkers[color] = id;

    var defs = getDefs(dom.ownerSVGElement);
    vivasvg.appendTo(defs, [
      '<marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth"',
      '        markerWidth="10" markerHeight="5" orient="auto"',
      '        style="fill: "' + color + '>',
      '  <path d="M 0 0 L 10 5 L 0 10 z"></path>',
      '</marker>'].join('\n'));
  }

  function getDefs(svgRoot) {
    return svgRoot.getElementsByTagName('defs')[0] ||
            vivasvg.appendTo(svgRoot, '<defs></defs>');
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
