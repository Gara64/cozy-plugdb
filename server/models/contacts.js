var americano = require('americano');

module.exports = Contacts = americano.getModel('Contact', {
      "id": String,
      "fn": String,
      "n": String,
      "datapoints": Array,
      "note": String 
});
