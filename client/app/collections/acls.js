acl = require('../models/acl');
module.exports = ACLs = Backbone.Collection.extend({
    model: acl,
    url: 'acls',
});
