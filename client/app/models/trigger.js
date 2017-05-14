module.exports = Trigger = Backbone.Model.extend({
    urlRoot: 'triggers',
    defaults: {
        id: String,
        type: String,
        who: Object,
        what: Object
    },
});
