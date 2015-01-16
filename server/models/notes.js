var americano = require('americano');

module.exports = Note = americano.getModel('note', {
      "id": String,
      "title": String,
      "parent_id" :String,
      "path": String,
      "version": Number,
      "content": { "type": String, "default": ""}
});
