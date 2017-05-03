module.exports = Rule = Backbone.Model.extend({
    urlRoot: 'sharingrule',
    defaults: {
        id: String,
        filterDoc: Object,
        filterUser: Object,
        docIDs: [String],
        userIDs: [String]
    },


});
