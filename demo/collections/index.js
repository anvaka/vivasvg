var vivasvg = require('../../');
var observableCollection = new vivasvg.Collection();
var createRandomPoint = require('./data/randomPoint');

vivasvg.bootstrap(document.getElementById('scene'), {
  points: observableCollection
});

modifyCollection();

function modifyCollection() {
  var shouldAdd = Math.random() >= 0.45;
  if (shouldAdd) {
    observableCollection.push(createRandomPoint());
  } else if (observableCollection.length){
    var removeIdx = Math.round(Math.random() * observableCollection.length - 1);
    observableCollection.splice(removeIdx, 1);
  }
  setTimeout(modifyCollection, Math.random() * 1000);
}
