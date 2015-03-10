var americano = require('americano-cozy');
var Binary = require('./binary');

module.exports = Photo = americano.getModel('Photo', {
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
   
