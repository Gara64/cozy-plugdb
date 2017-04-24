var cozydb = require('cozydb');
var Binary = require('./binary');

module.exports = Photo = cozydb.getModel('Photo', {
    id : String,
    title : String,
    description : String,
    orientation : Number,
    binary : function(x) {
        return x;
    },
    _attachments : Object,
    albumid : String,
    date : String
});
