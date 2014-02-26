# vivasvg

SVG rendering library with emphasis on declarative API

# Demo

Here is a little demo, which renders SVG text at random positions:

index.html:

``` html
<svg id='scene'>
  <items source="{{points}}">
    <text x="{{x}}" y="{{y}}" fill="{{color}}">{{color}}</text>
  </items>
</svg>
```

JavaScript file provides data context and bootstraps `vivasvg`:

``` js
var dataContext = {
  points: [..] // Each point has {x, y, color} attributes
};

var vivasvg = require('vivasvg');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);
```

See [demo](./demo) folder for working example.

# Rationale

I believe in declarative syntax for UI. HTML is a declarative markup language.
Angular.js takes HTML programming to the next level.

This repository tries to fill a niche between ease of declarative programming
and high data binding performance for SVG drawing.

# Warning

I attempted many times to implement something similar, and failed many times.
I will not be disappointed if this repository will also be a failure. Please
don't use this, unless you also believe it's a nice experiment or want to help me.

I'd love to know what you think :)!

# license

MIT
