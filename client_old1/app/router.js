var AppView = require('views/home_view');
var PlugCollection = require('collections/plugs');

var plugs = require('collections/plugs');

module.exports = Backbone.Router.extend({
    routes: {
      "": "main",
      "init": "init",
      "close": "close",
      "insert": "insert",
      "select": "select",
      "replicate": "replicate"    
    },

    main: function() {
      var mainView = new AppView({
        collection: plugs
      });
      mainView.render();
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
    },

});

