// See documentation on https://github.com/frankrousseau/americano#routes

var plug = require('./plug');

module.exports = {
  'plug': {
    get: plug.main
  }, 
  'init' : {
      get: plug.init
  },
  'close' : {
      get: plug.close
  }
};

