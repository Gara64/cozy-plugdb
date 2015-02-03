//var View = require('./view');
//var Plug = require('../models/plug');

module.exports = AppView = Backbone.View.extend({
	el: 'body',
	template: require('./templates/home'),
	events: {
	    "click #initPlug": "init",
	    "click #closePlug": "close",
	    "click #insert": "insert",
	    "click #replicate": "replicate"
	},
/*
	init: function () {
        //$('body').html(application.homeView.render().el);
        //alert('test');
	}, 

	close: function () {
	},

	insert: function (event) {

	},

	select: function () {
	},

	share: function () {
	}, 
	// initialize is automatically called once after the view is constructed
	/*initialize: function() {
	    this.listenTo(this.collection, "add", this.onBookmarkAdded);
	},
	/*onInsertPlug: function(model) {
	    // re-render the view
	    this.render();
	},*/
	render: function() {
        this.$el.html(this.template({
            plugs: this.collection.toJSON()
        }));

        return this;
    }
});



