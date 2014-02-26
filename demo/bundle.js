;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var points = createRandomPoints();

var svg = require('../');

var svgDoc = svg.document(document.body);
var collection = svg.collection();

collection.setItemTemplate('<rect x="{{x}}" y="{{y}}" fill="{{color}}" width="10px" height="10px"></rect>');
collection.setItemSource(points);
svgDoc.appendChild(collection);
svgDoc.render();

function createRandomPoints(count) {
  var colors = require('./randomColors');
  var points = [];
  for (var i = 0; i < count; ++i) {
    points.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      fill: colors[(Math.random() * colors.length) | 0]
    });
  }
  return points;
}

},{"../":3,"./randomColors":2}],2:[function(require,module,exports){
module.exports = ["#8FBC8F","#EEE8AA","#DC143C","#8A2BE2","#C0C0C0","#00008B","#DDA0DD","#008080","#FF6347","#808000","#B0E0E6","#DEB887","#2F4F4F","#FF00FF","#FFEBCD","#F5FFFA","#CD5C5C","#191970","#4682B4","#E9967A","#A0522D","#800080","#2E8B57","#40E0D0","#FFEFD5","#FF1493","#FFFF00","#8B008B","#87CEEB","#483D8B","#5F9EA0","#4B0082","#98FB98","#6B8E23","#48D1CC","#556B2F","#BA55D3","#FAFAD2","#B22222","#8B0000","#F8F8FF","#FFFFF0","#FFC0CB","#D8BFD8","#F0F8FF","#00FFFF","#F0FFF0","#FF69B4","#FFF0F5","#FAF0E6","#000000","#00BFFF","#F5DEB3","#D3D3D3","#F08080","#FFDAB9","#EE82EE","#FDF5E6","#228B22","#FF7F50","#778899","#FFF8DC","#DB7093","#FFD700","#7FFFD4","#FAEBD7","#800000","#FF4500","#D2B48C","#6495ED","#FFA500","#E0FFFF","#FFFACD","#FFE4B5","#FFA07A","#9370DB","#4169E1","#9ACD32","#FFFAF0","#F0E68C","#00FF7F","#9932CC","#8B4513","#A52A2A","#000080","#DCDCDC","#9400D3","#FFFFE0","#008000","#FFE4E1","#CD853F","#FFFFFF","#F5F5DC","#696969","#00CED1","#87CEFA","#7B68EE","#ADD8E6","#E6E6FA","#808080","#D2691E","#00FFFF","#1E90FF","#20B2AA","#DA70D6","#FFB6C1","#B0C4DE","#3CB371","#708090","#B8860B","#0000FF","#ADFF2F","#BC8F8F","#DAA520","#00FF00","#FF8C00","#0000CD","#BDB76B","#C71585","#6A5ACD","#66CDAA","#AFEEEE","#FF00FF","#90EE90","#32CD32","#008B8B","#F0FFFF","#F5F5F5","#00FA9A","#FFDEAD","#7FFF00","#A9A9A9","#FFE4C4","#FA8072","#FF0000","#F4A460","#7CFC00","#006400","#FFF5EE","#FFFAFA"];

},{}],3:[function(require,module,exports){
module.exports = {
  document: require('./lib/document'),
  collection: require('./lib/collection')
};

},{"./lib/collection":4,"./lib/document":5}],4:[function(require,module,exports){
module.exports = collection;

function collection() {

  return {
    setItemTemplate : function (itemTemplate) {
    },

    setItemSource : function (itemSource) {
    },
  };
}


},{}],5:[function(require,module,exports){
module.exports = svgDocument;

function svgDocument(container) {

  return {
    appendChild: function (child) {

    },

    render: function () {
    }
  };
}


},{}]},{},[1])
;