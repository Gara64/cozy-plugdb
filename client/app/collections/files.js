File = require('../models/file');
module.exports = Files = Backbone.Collection.extend({
    model: File,
    url: 'files',
});
