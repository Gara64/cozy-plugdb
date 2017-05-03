Tag = require('../models/tag');
module.exports = Tags = Backbone.Collection.extend({
    model: Tag,
    url: 'tags',
});
