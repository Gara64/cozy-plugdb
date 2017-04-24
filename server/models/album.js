var cozydb = require('cozydb');
var Photo = require('./photo');

  module.exports = Album = cozydb.getModel('Album', {
    id: String,
    title: String,
    description: String,
    date: Date,
    orientation: Number,
    coverPicture: String,
    clearance: function(x) {
      return x;
    },
    folderid: String
  });
