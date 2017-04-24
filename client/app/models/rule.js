module.exports = Rule = Backbone.Model.extend({
    urlRoot: 'rule',
    defaults: {
        docType: null,
        docAttr: null,
        docVal: null,
        subAttr: null,
        subVal: null,
    },

    create: function(callback) {
        $.ajax({
            url: 'rule',
            type: 'POST',
            data: {
                docType: this.get('docType'),
                docAttr: this.get('docAttr'),
                docVal: this.get('docVal'),
                subAttr: this.get('subAttr'),
                subVal: this.get('subVal')
            },

            success:function(result){
                callback("Create rule ok !");
            },
            error: function(result, response) {
                callback("Create rule failed !");
            }
        });
    },

});
