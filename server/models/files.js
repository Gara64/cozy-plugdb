var cozydb = require('cozydb');

module.exports = File = cozydb.getModel('file', {
      "id": String,
      "name": String,
      "tags": [String]
});
