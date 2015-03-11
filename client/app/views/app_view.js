var Plug = require('../models/plug');
//var Device = require('../models/device');

module.exports = AppView = Backbone.View.extend({

    el: 'body',
    template: require('../templates/home'),
    events: {
    	"click #registerDevice" : "registerDevice",
    	"click #insertDocs": "createDocs",
    	"click #replicateContacts" :"replicate",
    	"click #replicatePhotos" :"replicate",
    	"click #cancel": "cancelReplications"
	},

    render: function() {
    	var model = this.model;
        this.$el.html(this.template({status:model.get('status')}));
    	return this;
    }, 

    updateStatus: function() {
    	//this.$el.find('')
    },


    replicate: function(event) {
    	event.preventDefault();
    	var plug = this.model;
        var dataType = $(event.currentTarget).data('datatype');
    	plug.set({
    		dataType: dataType
    	});
    	plug.replicate(function(res) {
    		plug.set({status: res});
    	});
    },

    cancelReplications: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.cancelReplications(function(res) {
    		plug.set({status: res});
    	});
    },

    registerDevice: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.set({
    		target: this.$el.find('input[name="targetURL"]').val()
    	});

    	plug.register(function(res) {
    		plug.set({status: res});
    	});
    },


    createDocs: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.set({nDocs: this.$el.find('input[name="nDocs"]').val()});
    	plug.generate(function(res) {
    		plug.set({status: res});
    	});
    },

/*
    	event.preventDefault();
    	var model = this.model;
    	model.urlRoot = 'plug/replicate/true';
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

    cancelReplications: function(event) {
    	event.preventDefault();
    	var model = this.model;
    	model.urlRoot = 'plug/replicate/false';
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
        var plug = new Plug({
        	target: this.$el.find('input[name="targetURL"]').val(), 
	 		password: this.$el.find('input[name="pwd"]').val(),
	 		devicename: this.$el.find('input[name="devicename"]').val()
        })
	    plug.urlRoot = 'plug/register/true';
	    plug.save({}, {
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
        var plug = new Plug({
        	target: this.$el.find('input[name="targetURL"]').val(), 
	 		password: this.$el.find('input[name="pwd"]').val(),
	 		devicename: this.$el.find('input[name="devicename"]').val()
        })
	    plug.urlRoot = 'plug/register/false';
	    plug.save({}, {
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
	    var plug = this.model;
        plug.set({nDocs: this.$el.find('input[name="nDocs"]').val()});
	    plug.urlRoot = 'plug/insert'; 

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
*/
	// initialize is automatically called once after the view is constructed
	initialize: function() {
	    //this.listenTo(this.collection, "insert", this.onInsertPlug);
	    this.model.on('change:status', this.render, this);
	},

	onInsertPlug: function(model) {
	    // re-render the view
	    this.render();
	}
});
