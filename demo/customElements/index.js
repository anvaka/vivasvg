require('./arrow');

var dataContext = {
  from : {x: 10, y: 10},
  to: {x: 100, y: 100},
  color: 'deepskyblue'
};

var vivasvg = require('../../');
vivasvg.bootstrap(document.getElementById('scene'), dataContext);
