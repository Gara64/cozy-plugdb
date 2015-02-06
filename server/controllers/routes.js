// See documentation on https://github.com/frankrousseau/americano#routes

var plug = require('./plug');

module.exports = {
  '': {
      get: plug.main
  },

  'plug/init' : {
      post: plug.init
  },
  'plug/insert' : {
      post: plug.insert,
      get: plug.insert,
      put: plug.insert
  },
  'plug/replicate/:bool' : {
      post: plug.replicate
  },
  'plug/register/:bool' : {
    post: plug.register
  },
  'plug/close' : {
      post: plug.close
  }
};

