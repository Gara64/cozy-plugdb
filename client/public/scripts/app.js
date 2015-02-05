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

require.register("models/device", function(exports, require, module) {
module.exports = Device = Backbone.Model.extend({
	url: '',
	defaults: {
		password: null,
		target: null,
		devicename: null, 
		status: null
	}

});
});

require.register("models/plug", function(exports, require, module) {
module.exports = Plug = Backbone.Model.extend({
	urlRoot: '',
	defaults: {
		nDocs: null,
		status: null
	}

});

});

require.register("router", function(exports, require, module) {
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

});

require.register("templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Plug app</h1><p>Status PlugDB :<strong id="status">' + escape((interp = status) == null ? '' : interp) + '</strong></p><hr/><form><button id="initPlug">Start PlugDB</button><button id="closePlug">Close PlugDB</button></form><br/><form><label>Target URL : </label><input type="text" name="targetURL"/><label>Device name : </label><input type="text" name="devicename" size="10"/><label>Password : </label><input type="password" name="pwd" size="10"/><input id="registerDevice" type="submit" value="Register"/><input id="unregisterDevice" type="submit" value="Unregister"/></form><br/><br/><form><label>Generate n Contacts and insert the ids in PlugDB :</label><input type="text" name="nDocs" size="1"/><input id="insertDocs" type="image" src="./images/generate.png" alt="submit" height="50" width="50"/><!--input(id="insertDocs", type="submit", value="Generate")--><!--img(src="./images/generate.png", height="50", width="50")--></form><p>Share all my contacts ! <a href=""><img id="replicate" src="./images/share.jpg" height="60" width="60"/></a></p><br/><br/><!--p Extra : --><!--form--><!--	label Target URL : --><!--	input(type="text", name="targetURL", size=10)--><!--	input(id="registerDevice", type="submit", value="Unregister device")--><!----><p>Cancel all current replications : <a href=""><img id="cancel" src="./images/cancel.png" height="50" width="50"/></a></p><!--form--><!--	input(id="cancelReplication", type="submit", value="Cancel all replications")--><ul></ul><li> <a href="https://github.com/Gara64/cozy-plugdb">Github</a></li>');
}
return buf.join("");
};
});

require.register("views/app_view", function(exports, require, module) {
var Plug = require('../models/plug');
var Device = require('../models/device');

module.exports = AppView = Backbone.View.extend({

    el: 'body',
    template: require('../templates/home'),
    events: {
    	"click #initPlug" : "initPlug",
    	"click #closePlug" : "closePlug",
    	"click #registerDevice" : "registerDevice",
    	"click #unregisterDevice" : "unregisterDevice",
    	"click #insertDocs": "createDocs",
    	"click #replicate" :"replicate",
    	"click #cancel": "cancel"
	},

    render: function() {
    	var model = this.model;
        this.$el.html(this.template({status:model.get('status')}));
    	return this;
    }, 

    updateStatus: function() {
    	//this.$el.find('')
    },

    initPlug: function(event) {
    	event.preventDefault();
    	_this = this;
    	var plug = new Plug({});
	    plug.urlRoot = '/init';
	    plug.save({}, {
	    	success: function(model, response) {
	    		console.log('ok');
	    		_this.model.set({status: "Init succeeded"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		console.log('nok');
	    		if(response.responseText) {
	    			var rep = JSON.parse(response.responseText);
	    			_this.model.set({status: rep.error});
		        	_this.render();
	    		}
	    		else {
	    			_this.model.set({status: response});
	    		}
	    		_this.render();
	    		
	    	}
	    });
    },

    closePlug: function(event) {
    	event.preventDefault();
    	_this = this;
    	var plug = new Plug({});
	    plug.urlRoot = '/close';
	    plug.save({}, {
	    	success: function(model, response) {
	    		_this.model.set({status: "Close ok"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		var rep = JSON.parse(response.responseText);
	    		_this.model.set({status: rep.error});
		        _this.render();
	    	}
	    });
    },

    replicate: function(event) {
    	event.preventDefault();
    	var model = this.model;
    	model.url = '/replicate/true';
    	model.save({}, {
	    	success: function(model, response) {
	    		_this.model.set({status: "Sharing ok !"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		var rep = JSON.parse(response.responseText);
	    		_this.model.set({status: rep.error});
		        _this.render();
	    	}
	    });
    },

    cancel: function(event) {
    	event.preventDefault();
    	var model = this.model;
    	model.url = '/replicate/false';
    	model.save({}, {
	    	success: function(model, response) {
	    		_this.model.set({status: "Cancel replications ok"});
		        _this.render();
	    	}, 
	    	error: function(model, response) {
	    		var rep = JSON.parse(response.responseText);
	    		_this.model.set({status: rep.error});
		        _this.render();
	    	}
	    });
    },

	registerDevice: function(event) {
		event.preventDefault();
		_this = this;
		var device = new Device({
			target: this.$el.find('input[name="targetURL"]').val(),
			password: this.$el.find('input[name="pwd"]').val(),
			devicename: this.$el.find('input[name="devicename"]').val()
		});
		console.log('name ' + device.get('devicename'));
		console.log('url ' + device.get('target'));
	    device.url = '/register/true';
	    device.save({}, {
	    	success: function(model, response) {
		        _this.model.set({status: "Device correctly registered"});
		        _this.render();
		    },
		    error: function(model, response) {
		    	var rep = JSON.parse(response.responseText);
		        _this.model.set({status: rep.error});
		        _this.render();
		    }
		});

	}, 

	unregisterDevice: function(event) {
		event.preventDefault();
		_this = this;
		var device = new Device({
			target: this.$el.find('input[name="targetURL"]').val(),
			password: this.$el.find('input[name="pwd"]').val(),
			devicename: this.$el.find('input[name="devicename"]').val()
		});
		device.url = '/register/false';
	    device.save({}, {
	    	success: function(model, response) {
		        _this.model.set({status: "Device correctly unregistered"});
		        _this.render();
		    },
		    error: function(model, response) {
		        var rep = JSON.parse(response.responseText);
		        _this.model.set({status: rep.error});
		        _this.render();
		    }
		});
	},

    createDocs: function(event) {
	    // submit button reload the page, we don't want that
	   event.preventDefault();	
	   _this = this;
	    // create a new model
	    var plug = new Plug({
	        nDocs: this.$el.find('input[name="nDocs"]').val()
	    });
	    plug.urlRoot = '/insert'; 

	    // add it to the collection
	   //his.collection.add(plug);

	    plug.save({}, {
		    success: function(model, response) {
		        _this.model.set({status: "Insert " + plug.get('nDocs') + ' docs ok !'});
		        _this.render();
		    },
		    error: function(model, response) {
		        var rep = JSON.parse(response.responseText);
		        _this.model.set({status: rep.error});
		        _this.render();
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