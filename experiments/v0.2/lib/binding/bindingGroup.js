/**
 * Binding group holds collection of bindings. Main reason why binding group
 * exists is to provide delayed update of binding targets.
 *
 * When binding source notifies a binding object about change, binding object
 * may not immediately update target. All updates should happen within
 * one call inside RequestAnimationFrame callback to optimize rendering performance
 *
 * Thus each binding object marks itself as dirty when source changes, and
 * registers itself within binding group for update when possible.
 */
module.exports = bindingGroup;

function bindingGroup() {
  return {
    createBinding: createBinding,
  };

  function createBinding(propertyName, viewModel, setter) {
    viewModel.bind(propertyName, setter);
    viewModel.invalidate(propertyName);
  }
}
