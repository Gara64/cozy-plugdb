module.exports = Plug = Backbone.Model.extend({
	urlRoot: 'plug',
	defaults: {
		nDocs: null,
		status: null,
        devicename: null,
        target: null,
        password: null
	}

});
