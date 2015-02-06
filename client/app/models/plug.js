module.exports = Plug = Backbone.Model.extend({
	urlRoot: 'plug',
	defaults: {
		nDocs: null,
		status: null,
        devicename: null,
        target: null,
        password: null
	}, 

    init: function(callback) {
		$.ajax({
	        url: 'plug/init',
	        type: 'POST',
	        success:function(result){
	        	callback("Initialization successful !");
	        	//newObject.twittername = result.name; ;
	            //that.$el.html(that.template(newObject));
	        },
	        error: function(result, response) {
	        	callback("Initialization failed !");
	        }
	    });
	},

	close: function(callback) {
		$.ajax({
	        url: 'plug/close',
	        type: 'POST',
	        success:function(result){
	        	callback("Shutdown successful !");
	        },
	        error: function(result, response) {
	        	callback("Shutdown failed !");
	        }
	    });
	},

	replicate: function(callback) {
		$.ajax({
	        url: 'plug/replicate/true',
	        type: 'POST',
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
	        	callback("Cancel failed !");
	        }
	    });
	},

	register: function(callback) {
		$.ajax({
	        url: 'plug/register/true',
	        type: 'POST',
	        data: {
	        	target: this.get('target'), 
	        	devicename: this.get('devicename'), 
	        	password: this.get('password')
	        },
	        success:function(result){
	        	callback("Device correctly registered !");
	        },
	        error: function(result, response) {
	        	callback("Device could not be registered :/");
	        }
	    });
	},

	unregister: function(callback) {
		$.ajax({
	        url: 'plug/register/false',
	        type: 'POST',
	        data: {
	        	target: this.get('target'), 
	        	devicename: this.get('devicename'), 
	        	password: this.get('password')
	        },
	        success:function(result){
	        	callback("Device correctly unregistered !");
	        },
	        error: function(result, response) {
	        	callback("Device could not be unregistered :/");
	        }
	    });
	},

	generate: function(callback) {
		$.ajax({
	        url: 'plug/insert',
	        type: 'POST',
	        data: {
	        	nDocs: this.get('nDocs')
	        },
	        success:function(result){
	        	callback("Insert " + this.get('nDocs') + " docs ok !");
	        },
	        error: function(result, response) {
	        	callback("Insertion failed !");
	        }
	    });
	},


});
