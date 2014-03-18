/**
 * This file contains optimized target setters for standard svg properties.
 *
 * Usually it is much faster to use property specific setters than generic
 * element.setAttributeNS() method.
 *
 * For example circle.cx.baseVal.value is ~2x faster than setAttributeNS(null, 'cx', x) api.
 */

var bindingRule = require('./bindingRule').bindingRule;

bindingRule('circle', 'cx', function (ui) {
  var baseVal = ui.cx.baseVal;
  return function (newValue) {
    baseVal.value = newValue;
  };
});

bindingRule('circle', 'cy', function (ui) {
  var baseVal = ui.cy.baseVal;
  return function (newValue) {
    baseVal.value = newValue;
  };
});
