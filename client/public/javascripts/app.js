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
// Application bootstrapper.
var Application = {
  initialize: function () {
    var HomeView = require('views/home_view'), Router = require('router');
    // Ideally, initialized classes should be kept in controllers & mediator.
    // If you're making big webapp, here's more sophisticated skeleton
    // https://github.com/paulmillr/brunch-with-chaplin
    this.homeView = new HomeView();
    this.router = new Router();
    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  }
};

module.exports = Application;

});

require.register("initialize", function(exports, require, module) {
var application = require('application');

$(function () {
  application.initialize();
  Backbone.history.start();
});

});

require.register("lib/view_helper", function(exports, require, module) {
// Put your handlebars.js helpers here.

});

;require.register("models/collection", function(exports, require, module) {
// Base class for all collections.
module.exports = Backbone.Collection.extend({
});

});

require.register("models/model", function(exports, require, module) {
// Base class for all models.
module.exports = Backbone.Model.extend({
});

});

require.register("router", function(exports, require, module) {
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


});

require.register("views/home_view", function(exports, require, module) {
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




});

require.register("views/plug", function(exports, require, module) {
// apps/views/plug.js

module.exports = PlugView = Backbone.View.extend({
  /*el: 'body',
  render: function() {
    $(this.el).html(this.template);
    return $(this.el);
  },*/

  id: 'plug-view',


template: require('./templates/home'),
events: {
    "click #initPlug": "init",
    "click #closePlug": "close",
    "click #insert": "insert",
    "click #replicate": "replicate"
},

init: function () {
        //$('body').html(application.homeView.render().el);
        alert('test');
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



});

require.register("views/plug_view", function(exports, require, module) {
// apps/views/plug.js

var View = Backbone.View.extend({
  el: 'body',
  render: function() {
    $(this.el).html(this.template);
    return $(this.el);
  },


template: require('./templates/home'),
events: {
    "click #initPlug": "init",
    "click #closePlug": "close",
    "click #insert": "insert",
    "click #replicate": "replicate"
},

init: function () {
        //$('body').html(application.homeView.render().el);
        alert('test');
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



});

require.register("views/templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="content"><h1>Plug app</h1><p>Status PlugDB :<strong id="status">' + escape((interp = status) == null ? '' : interp) + '</strong></p><hr/><button id="initPlug">Start PlugDB</button><button id="closePlug">Close PlugDB</button><br/><br/><form action="insert" method="post" name="insert"><p>Generate n Contacts and insert the ids in PlugDB :</p><input type="text" id="nDocs" size="5"/><input type="submit" value="Generate"/></form><p>Share all my contacts ! <a href="replicate"></a><img src="./images/share.jpg" height="60" width="60"/></p><ul></ul><li> <a href="https://github.com/Gara64/cozy-plugdb">Github</a></li></div>');
}
return buf.join("");
};
});

require.register("views/view", function(exports, require, module) {
require('lib/view_helper');

// Base class for all views.
module.exports = Backbone.View.extend({
  initialize: function () {
    this.render = _.bind(this.render, this);
  },

  template: function () { return null; },
  getRenderData: function () { return null; },

  render: function () {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  },

  afterRender: function () { return null; }
});

});


//# sourceMappingURL=app.js.map