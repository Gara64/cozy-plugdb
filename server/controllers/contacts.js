// Generated by CoffeeScript 1.8.0
(function() {
  var contacts, plug;

  contacts = require('../models/contacts');

  plug = require('./plug.js');

  module.exports.list = function(req, res, next) {
    return contacts.request('all', function(error, contacts) {
      if (error) {
        return next(error);
      }
      return plug.filterContactsPlug(contacts, function(err, filteredContacts) {
        if (err) {
          return next(error);
        }
        return res.send(filteredContacts);
      });
    });
  };

  module.exports.get = function(req, res, next) {
    return contacts.find(req.params.id, function(error, contact) {
      if (error) {
        return next(error);
      }
      return res.send(contact);
    });
  };

  module.exports.change = function(req, res, next) {
    console.log('log1');
    return contacts.find(req.params.id, function(error, contact) {
      console.log('log2', req.body, error);
      if (error) {
        return next(error);
      }
      return contact.updateAttributes(req.body, function(error, contact) {
        console.log('log3', contact);
        if (error) {
          return next(error);
        }
        return res.send(contact);
      });
    });
  };

}).call(this);
