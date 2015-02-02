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
    	var plug = new Plug({});
	    plug.urlRoot = '/init';
	    plug.save();

    },

    closePlug: function(event) {
    	event.preventDefault();
    	var plug = new Plug({});
	    plug.urlRoot = '/close';
	    plug.save();
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
		        console.log('SUCCESS:');
		        _this.model.set({status: response.responseText});
		        _this.render();
		    },
		    error: function(model, response) {
		        console.log('FAIL:');
		        console.log(response);
		        console.log('responseText : ' + response.responseText);
		        _this.model.set({status: response.responseText});
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
		        console.log('SUCCESS:');
		        _this.model.set({status: response.responseText});
		        _this.render();
		    },
		    error: function(model, response) {
		        console.log('FAIL:');
		        console.log(response);
		        console.log('responseText : ' + response.responseText);
		        _this.model.set({status: response.responseText});
		        _this.render();
		    }
		});
	},

    createDocs: function(event) {
	    // submit button reload the page, we don't want that
	   event.preventDefault();	

	    // create a new model
	    var plug = new Plug({
	        nDocs: this.$el.find('input[name="nDocs"]').val()
	    });
	    plug.urlRoot = '/insert'; 

	    // add it to the collection
	   //his.collection.add(plug);

	    plug.save({}, {
		    success: function(model, response) {
		        console.log('SUCCESS:');
		        console.log(response);
		    },
		    error: function(model, response) {
		        console.log('FAIL:');
		        console.log(response);
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