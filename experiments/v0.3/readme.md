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
supposed to reevaluate expressions every 12ms. There is upper limit in the
browser to how many SVG DOM nodes it can render at 60 fps. It's much higher than
what angular has. E.g. here is [rendering of 1k](http://embed.plnkr.co/xZK8VSpzdCM2l06Sbma6/preview)
elements with angular. Compare it with [native rendering of 1k](http://embed.plnkr.co/i9UBJoamLLpVMY4a1DCF/preview)
elements.

