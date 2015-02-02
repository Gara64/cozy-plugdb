var AppView = require('views/app_view');
var PlugCollection = require('collections/plugs');
var DeviceModel = require('models/device');

var plugs = new PlugCollection();
var device = new DeviceModel();

module.exports = Router = Backbone.Router.extend({

    routes: {
        '': 'main',
        'insert': 'insertPlug'
    },

    main: function() {
        var mainView = new AppView({
            collection: plugs,
            model: device
        });
        mainView.render();
    },

    insertPlug: function() {
    	//alert('toto');
    }
});
