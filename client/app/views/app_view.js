var Plug = require('../models/plug');

module.exports = AppView = Backbone.View.extend({

    el: 'body',
    template: require('../templates/home'),
    events: {
    	"click #insertDocs": "createDocs"
	},

    render: function() {
        this.$el.html(this.template({
            plugs: this.collection.toJSON()
        }));

        return this;
    }, 

    createDocs: function(event) {
	    // submit button reload the page, we don't want that
	   event.preventDefault();	

	    // create a new model
	    var plug = new Plug({
	        nDocs: this.$el.find('input[name="nDocs"]').val()
	    });

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