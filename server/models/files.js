var americano = require('americano');

module.exports = File = americano.getModel('file', {
      "id": String,
      "name": String,
      "content": { "type": String, "default": ""}
});
