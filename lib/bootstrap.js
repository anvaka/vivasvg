module.exports = function (domRoot, dataContext) {
  var markup = domRoot.innerHTML;
  while (domRoot.firstChild) {
    domRoot.removeChild(domRoot.firstChild);
  }

  var svgDoc = require('./controls/document')(domRoot);
  svgDoc.dataContext(dataContext);

  var contentControl = require('./controls/contentControl')();
  contentControl.markup(markup);

  svgDoc.appendChild(contentControl);
  svgDoc.render();
};
