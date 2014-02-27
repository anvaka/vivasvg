module.exports = function (domRoot, dataContext) {
  var content = domRoot.innerHTML;
  while (domRoot.firstChild) {
    domRoot.removeChild(domRoot.firstChild);
  }

  var svgDoc = require('./controls/document')(domRoot);
  var contentControl = require('./controls/contentControl')();
  contentControl.dataContext(dataContext);
  contentControl.markupPrototype(content);

  svgDoc.appendChild(contentControl);
  svgDoc.render();
};
