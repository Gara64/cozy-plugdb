// See documentation on https://github.com/frankrousseau/americano#routes

var plug     = require('./plug');
var contacts = require('./contacts');

module.exports = {
  '': {
      get: plug.main
  },

  'plug/generate' : {
      post: plug.insert,
      put: plug.insert
  },
  'plug/select': {
      //get: plug.select
  },
  'plug/replicate/:bool' : {
      post: plug.replicate
  },
  'plug/register/:bool' : {
      post: plug.register
  },
   'contacts': {
      get: contacts.list
   },
   'contacts/:id': {
      get: contacts.get,
      put: contacts.change
   },
   'plug/init' : {
      post: plug.init
  },
   'plug/close' : {
      post: plug.close
  },
  'plug/reset' : {
      post: plug.reset
  },
  'plug/authFP' : {
      post: plug.authFP
  },
  'plug/status' : {
    get: plug.status
  },
};

