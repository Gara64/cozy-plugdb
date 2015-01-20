// See documentation on https://github.com/frankrousseau/americano#routes

var plug = require('./plug');

module.exports = {
  '': {
      get: plug.main
  },

  'init' : {
      get: plug.init
  },
  'insert' : {
      post: plug.insert
  },
  'close' : {
      get: plug.close
  }
};

