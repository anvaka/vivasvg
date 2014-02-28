var vivasvg = require('../../');
var observableCollection = new vivasvg.Collection();
var createRandomPoint = require('./data/randomPoint');

vivasvg.bootstrap(document.getElementById('scene'), {
  points: observableCollection
});

modifyCollection();

function modifyCollection() {
  observableCollection.push(createRandomPoint());
  setTimeout(modifyCollection, Math.random() * 1000);
}
