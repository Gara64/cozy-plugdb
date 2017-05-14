module.exports = Rule = Backbone.Model.extend({
    urlRoot: 'sharingrule',
    defaults: {
        id: String,
        filterDoc: Object,
        filterUser: Object,
        docIDs: [Object],
        userIDs: [Object],
        tags: [String]
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
