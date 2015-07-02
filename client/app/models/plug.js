module.exports = Plug = Backbone.Model.extend({
    urlRoot: 'plug',
    defaults: {
        nDocs: null,
        baseName:null,
        status: null,
        devicename: null,
        target: null,
        password: null,
        dataType: null, 
        auth: false, 
        init: false,
        ids: null
    },

    replicate: function(callback) {
        $.ajax({
            url: 'plug/replicate/true',
            type: 'POST',
            data: {
                dataType: this.get('dataType'),
                target: this.get('target')
            },
            success:function(result){
                callback("Sharing ok !");
            },
            error: function(result, response) {
                callback("Replication failed !");
            }
        });
    },

    cancelReplications: function(callback) {
        $.ajax({
            url: 'plug/replicate/false',
            type: 'POST',
            success:function(result){
                callback("Cancel replication successful !");
            },
            error: function(result, response) {
                //callback("Cancel failed !");
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    register: function(callback) {
        $.ajax({
            url: 'plug/register/true',
            type: 'POST',
            data: {
                target: this.get('target')
            },
            success:function(result){
                callback("Ready to share !");
            },
            error: function(result, response) {
                callback("Not ready :/");
            }
        });
    },


    generate: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/generate',
            type: 'POST',
            data: {
                nDocs: this.get('nDocs'),
                baseName: this.get('baseName')
            },
            success:function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    init: function(callback) {
        $.ajax({
            url: 'plug/init',
            type: 'POST',
            success:function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    close: function(callback) {
        $.ajax({
            url: 'plug/close',
            type: 'POST',
            success:function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    reset: function(callback) {
        $.ajax({
            url: 'plug/reset',
            type: 'POST',
            success:function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    authenticateFP: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/authFP', 
            type: 'POST',
            success: function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    select: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/select', 
            type: 'GET',
            success: function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error);
            }
        });
    }, 

    insert: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/insert', 
            type: 'POST',
            data: {
                baseName: this.get('baseName')
            },
            success: function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error);
            }
        });
    }, 

    status: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/status', 
            type: 'GET',
            success: function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error);
            }
        });
    }


});
