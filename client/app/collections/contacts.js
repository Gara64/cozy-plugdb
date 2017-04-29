
Contact = require('../models/contact');

module.exports = Contacts = Backbone.Collection.extend({
    model: Contact,
    url: 'contacts',
});
