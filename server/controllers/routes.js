// See documentation on https://github.com/frankrousseau/americano#routes

var index = require('./index');

module.exports = {
  'plug': {
    get: index.main
  }
};

