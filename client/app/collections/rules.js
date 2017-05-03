Rule = require('../models/rule');
module.exports = Rules = Backbone.Collection.extend({
    model: Rule,
    url: 'sharingrule',

    defaults: {
        tags: [Object]
    },

    getSensitiveTags: function(callback) {
        _this = this
        $.ajax({
            url: 'tags',
            type: 'GET',
            success:function(result){
                _this.tags = result
                callback(null, result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, null);
            }
        });
    }
});
