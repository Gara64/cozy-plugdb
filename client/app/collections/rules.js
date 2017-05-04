Rule = require('../models/rule');
module.exports = Rules = Backbone.Collection.extend({
    model: Rule,
    url: 'sharingrule',
});
