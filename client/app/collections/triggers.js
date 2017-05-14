Trigger = require('../models/trigger');
module.exports = Triggers = Backbone.Collection.extend({
    model: Trigger,
    url: 'triggers',
});
