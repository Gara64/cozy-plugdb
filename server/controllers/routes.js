// See documentation on https://github.com/frankrousseau/americano#routes

var plug     = require('./plug');
var contacts = require('./contacts');
var sharing = require('./sharing');
var rule = require('./rule');

module.exports = {
  '': {
      get: plug.main
  },

  'plug/generate' : {
      post: plug.generate,
      put: plug.generate
  },
  'plug/insert' : {
      post: plug.insert
  },
  'plug/select': {
      get: plug.select
  },
  'plug/replicate/:bool' : {
      post: sharing.replicate
  },
   'contacts': {
      get: contacts.list
   },
   'contacts/:id': {
      get: contacts.get,
      put: contacts.change
   },
   'sharingrule': {
      get: rule.list
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
  'rule' : {
      post: rule.create
  }
};
