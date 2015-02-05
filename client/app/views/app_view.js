var Plug = require('../models/plug');
var Device = require('../models/device');

module.exports = AppView = Backbone.View.extend({

    el: 'body',
    template: require('../templates/home'),
    events: {
    	"click #initPlug" : "initPlug",
    	"click #closePlug" : "closePlug",
    	"click #registerDevice" : "registerDevice",
    	"click #unregisterDevice" : "unregisterDevice",
    	"click #insertDocs": "createDocs",
    	"click #replicate" :"replicate",
    	"click #cancel": "cancel"
	},

    render: function() {
    	var model = this.model;
        this.$el.html(this.template({status:model.get('status')}));
    	return this;
    }, 

    updateStatus: function() {
    	//this.$el.find('')
    },

    initPlug: function(event) {
    	event.preventDefault();
    	_this = this;
    	var plug = new Plug({});
	    plug.urlRoot = '/init';
	    plug.save({}, {
	    	success: function(model, response) {
	    		console.log('ok');
	    		_this.model.set({status: "Init succeeded"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		console.log('nok');
	    		if(response.responseText) {
	    			var rep = JSON.parse(response.responseText);
	    			_this.model.set({status: rep.error});
		        	_this.render();
	    		}
	    		else {
	    			_this.model.set({status: response});
	    		}
	    		_this.render();
	    		
	    	}
	    });
    },

    closePlug: function(event) {
    	event.preventDefault();
    	_this = this;
    	var plug = new Plug({});
	    plug.urlRoot = '/close';
	    plug.save({}, {
	    	success: function(model, response) {
	    		_this.model.set({status: "Close ok"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		var rep = JSON.parse(response.responseText);
	    		_this.model.set({status: rep.error});
		        _this.render();
	    	}
	    });
    },

    replicate: function(event) {
    	event.preventDefault();
    	var model = this.model;
    	model.url = '/replicate/true';
    	model.save({}, {
	    	success: function(model, response) {
	    		_this.model.set({status: "Sharing ok !"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		var rep = JSON.parse(response.responseText);
	    		_this.model.set({status: rep.error});
		        _this.render();
	    	}
	    });
    },

    cancel: function(event) {
    	event.preventDefault();
    	var model = this.model;
    	model.url = '/replicate/false';
    	model.save({}, {
	    	success: function(model, response) {
	    		_this.model.set({status: "Cancel replications ok"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		var rep = JSON.parse(response.responseText);
	    		_this.model.set({status: rep.error});
		        _this.render();
	    	}
	    });
    },

	registerDevice: function(event) {
		event.preventDefault();
		_this = this;
		var device = new Device({
			target: this.$el.find('input[name="targetURL"]').val(),
			password: this.$el.find('input[name="pwd"]').val(),
			devicename: this.$el.find('input[name="devicename"]').val()
		});
		console.log('name ' + device.get('devicename'));
		console.log('url ' + device.get('target'));
	    device.url = '/register/true';
	    device.save({}, {
	    	success: function(model, response) {
		        _this.model.set({status: "Device correctly registered"});
		        _this.render();
		    },
		    error: function(model, response) {
		    	var rep = JSON.parse(response.responseText);
		        _this.model.set({status: rep.error});
		        _this.render();
		    }
		});

	}, 

	unregisterDevice: function(event) {
		event.preventDefault();
		_this = this;
		var device = new Device({
			target: this.$el.find('input[name="targetURL"]').val(),
			password: this.$el.find('input[name="pwd"]').val(),
			devicename: this.$el.find('input[name="devicename"]').val()
		});
		device.url = '/register/false';
	    device.save({}, {
	    	success: function(model, response) {
		        _this.model.set({status: "Device correctly unregistered"});
		        _this.render();
		    },
		    error: function(model, response) {
		        var rep = JSON.parse(response.responseText);
		        _this.model.set({status: rep.error});
		        _this.render();
		    }
		});
	},

    createDocs: function(event) {
	    // submit button reload the page, we don't want that
	   event.preventDefault();	
	   _this = this;
	    // create a new model
	    var plug = new Plug({
	        nDocs: this.$el.find('input[name="nDocs"]').val()
	    });
	    plug.urlRoot = '/insert'; 

	    // add it to the collection
	   //his.collection.add(plug);

	    plug.save({}, {
		    success: function(model, response) {
		        _this.model.set({status: "Insert " + plug.get('nDocs') + ' docs ok !'});
		        _this.render();
		    },
		    error: function(model, response) {
		        var rep = JSON.parse(response.responseText);
		        _this.model.set({status: rep.error});
		        _this.render();
		    }
		});
	}, 

	// initialize is automatically called once after the view is constructed
	initialize: function() {
	    this.listenTo(this.collection, "insert", this.onInsertPlug);
	},
	onInsertPlug: function(model) {
	    // re-render the view
	    this.render();
	}
});