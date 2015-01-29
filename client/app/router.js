var AppView = require('views/app_view');
var PlugCollection = require('collections/plugs');

var plugs = new PlugCollection();

module.exports = Router = Backbone.Router.extend({

    routes: {
        '': 'main',
        'insert': 'insertPlug'
    },

    main: function() {
        var mainView = new AppView({
            collection: plugs,
        });
        mainView.render();
    },

    insertPlug: function() {
    	//alert('toto');
    }
});
