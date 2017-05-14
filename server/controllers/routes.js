// See documentation on https://github.com/frankrousseau/americano#routes

var plug     = require('./plug');
var contacts = require('./contacts');
var sharing = require('./sharing');
var rule = require('./rule');
var files = require('./files');
var tags = require('./tags');
var triggers = require('./triggers')

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
   'contacts/:id/picture.png':{
        get: contacts.picture
    },
   'sharingrule': {
      get: rule.list,
      post: rule.create
   },
   'sharingrule/:id': {
       get: rule.get,
       put: rule.change,
       delete: rule.remove
   },
   'triggers': {
      get: triggers.list,
      post: triggers.create
   },
   'triggers/:id': {
       get: triggers.get,
       put: triggers.change,
       delete: triggers.remove
   },
   'files/:fileid': {
        get: files.find
    },
   'files/:fileid/attach/:name': {
        get: files.getAttachment
    },
    'tags': {
        get: tags.listSensitiveTags
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
  }
};
