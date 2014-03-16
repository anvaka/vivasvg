# Idea

Declarative SVG should be driven by binding. There is no need to update svg element
unless binding source is changed. Binding should update its target only within
requestAnimationFrame scope (not sure if this is going to be faster, but it will be
better for battery for sure) - see [perf](perf) for performance comparisson.

Bindings should be specific to attributes.

E.g. consider a `circle` element. It has `cx`, and `cy` attributes, but instead
of calling generic

``` js
circle.setAttributeNS(null, 'cx', newValue);
```

It is almost two times faster to set it via:

``` js
circle.cx.baseVal.value = newValue;
```
