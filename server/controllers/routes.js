// See documentation on https://github.com/frankrousseau/americano#routes

var plug = require('./plug');

module.exports = {
  '': {
      get: plug.main
  },

  'init' : {
      post: plug.init
  },
  'insert' : {
      post: plug.insert,
      get: plug.insert
  },
  'replicate/:bool' : {
      post: plug.replicate
  },
  'register/:bool' : {
    post: plug.register
  },
  'close' : {
      post: plug.close
  }
};

