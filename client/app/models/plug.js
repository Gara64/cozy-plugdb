module.exports = Plug = Backbone.Model.extend({
	defaults: {
		nDocs: null
	}, 
	url: function() {
		return '/insert';
	}

});
