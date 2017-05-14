cozydb = require('cozydb');

module.exports = Trigger = cozydb.getModel('trigger', {
      "id": String,
      "type": String,
      "who": Object,
      "what": Object
});
