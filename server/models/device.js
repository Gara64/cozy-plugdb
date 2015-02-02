var americano = require('americano');

module.exports = Device = americano.getModel('Device', {
      "id": String,
      "login": String,
      "password": String,
      "url": String
});