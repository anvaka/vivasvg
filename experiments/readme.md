# Idea

Declarative SVG should be driven by binding. There is no need to update svg element
unless binding source is changed. Binding should update its target only within
requestAnimationFrame scope (not sure if this is going to be faster, but it will be
better for battery for sure) - see [perf](perf) for performance comparisson.
