var dataContext = {
  points: require('./randomPoints')(10)
};

var vivasvg = require('../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);
