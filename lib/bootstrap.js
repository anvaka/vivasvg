module.exports = function (domRoot, dataContext) {
  var content = domRoot.innerHTML;
  while (domRoot.firstChild) {
    domRoot.removeChild(domRoot.firstChild);
  }

  var svgDoc = require('./document')(domRoot);
  var contentControl = require('./contentControl')(content, dataContext);

  svgDoc.appendChild(contentControl);
  svgDoc.render();
};
