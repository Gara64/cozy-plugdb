(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
module.exports = {

    initialize: function() {
        var Router = require('router');
        this.router = new Router();
        Backbone.history.start();
    }
};
});

require.register("collections/plugs", function(exports, require, module) {
Plug = require('../models/plug');
module.exports = Plugs = Backbone.Collection.extend({
    model: Plug,
    url: 'insert'
});
});

require.register("initialize", function(exports, require, module) {
// The function called from index.html
$(document).ready(function() {
    var app = require('application');
    app.initialize()
});

});

require.register("models/plug", function(exports, require, module) {
module.exports = Plug = Backbone.Model.extend({
	defaults: {
		nDocs: null
	}, 
	url: function() {
		return '/insert';
	}

});

});

require.register("router", function(exports, require, module) {
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

});

require.register("templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Plug app</h1><p>Status PlugDB :<strong id="status">' + escape((interp = status) == null ? '' : interp) + '</strong></p><hr/><button id="initPlug">Start PlugDB</button><button id="closePlug">Close PlugDB</button><br/><br/><form><label>Generate n Contacts and insert the ids in PlugDB :</label><input type="text" name="nDocs" size="5"/><input id="insertDocs" type="submit" value="Generate"/></form><p>Share all my contacts ! <a href="replicate"><img src="./images/share.jpg" height="60" width="60"/></a></p><ul></ul><li> <a href="https://github.com/Gara64/cozy-plugdb">Github</a></li>');
}
return buf.join("");
};
});

require.register("views/app_view", function(exports, require, module) {
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
});


//# sourceMappingURL=app.js.map