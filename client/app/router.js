var application = require('application');

module.exports = Backbone.Router.extend({
    routes: {
      "": "main",
      "init": "init",
      "close": "close",
      "insert/:ndocs": "insert",
      "select": "select",
      "replicate": "replicate"    
    },

    main: function() {
        $('body').html(application.homeView.render().el);
    },

    init: function () {
        //$('body').html(application.homeView.render().el);
    }, 

    close: function () {
    },

    insert: function () {
    },

    select: function () {
    },

    replicate: function () {
    }

});

