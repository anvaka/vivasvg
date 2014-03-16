var vivasvg = require('./vivasvg');

vivasvg.makeBinding('circle', 'cx', function (ui, newValue) {
  ui.cx.baseVal.value = newValue;
});

vivasvg.makeBinding('circle', 'cy', function (ui, newValue) {
  ui.cy.baseVal.value = newValue;
});
