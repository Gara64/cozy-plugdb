var americano = require('americano');

module.exports = Contacts = americano.getModel('Contact', {
      "id"         : String,
      "fn"         : String,
      "n"          : String,
      "datapoints" : function(x){return x;},
      "note"       : String,
      "shared"     : Boolean
});
