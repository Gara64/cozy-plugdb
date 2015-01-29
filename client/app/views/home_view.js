var View = require('./view');
var template = require('./templates/home');

module.exports = View.extend({
	template: require('./templates/home'),
	events: {
	    "click #initPlug": "init",
	    "click #closePlug": "close",
	    "click #insert": "insert",
	    "click #replicate": "replicate"
	},

	init: function () {
        //$('body').html(application.homeView.render().el);
        //alert('test');
	}, 

	close: function () {
	},

	insert: function () {
	},

	select: function () {
	},

	share: function () {
	}
});



