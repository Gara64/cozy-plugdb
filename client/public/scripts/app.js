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
    url: 'insert',
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
	urlRoot: 'plug',
	defaults: {
		nDocs: null,
		status: null,
        devicename: null,
        target: null,
        password: null
	}, 


	replicate: function(callback) {
		$.ajax({
	        url: 'plug/replicate/true',
	        type: 'POST',
	        success:function(result){
	        	callback("Sharing ok !");
	        },
	        error: function(result, response) {
	        	callback("Replication failed !");
	        }
	    });
	},

	cancelReplications: function(callback) {
		$.ajax({
	        url: 'plug/replicate/false',
	        type: 'POST',
	        success:function(result){
	        	callback("Cancel replication successful !");
	        },
	        error: function(result, response) {
	        	callback("Cancel failed !");
	        }
	    });
	},

	register: function(callback) {
		$.ajax({
	        url: 'plug/register/true',
	        type: 'POST',
	        data: {
	        	target: this.get('target')
	        },
	        success:function(result){
	        	callback("Ready to share !");
	        },
	        error: function(result, response) {
	        	callback("Not ready :/");
	        }
	    });
	},


	generate: function(callback) {
		_this = this;
		$.ajax({
	        url: 'plug/insert',
	        type: 'POST',
	        data: {
	        	nDocs: this.get('nDocs')
	        },
	        success:function(result){
	        	callback("Insert " + _this.get('nDocs') + " docs ok !");
	        },
	        error: function(result, response) {
	        	callback("Insertion failed !");
	        }
	    });
	},


});

});

require.register("router", function(exports, require, module) {
var AppView = require('views/app_view');
var PlugCollection = require('collections/plugs');
var DeviceModel = require('models/device');
var PlugModel = require('models/plug');

var plugs = new PlugCollection();
var device = new DeviceModel();
var plug = new PlugModel();

module.exports = Router = Backbone.Router.extend({

    routes: {
        '': 'main',
        'insert': 'insertPlug'
    },

    main: function() {
        var mainView = new AppView({
            //collection: plugs,
            model: plug
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
buf.push('<h1>Sharing app</h1><p>Status :<strong id="status">' + escape((interp = status) == null ? '' : interp) + '</strong></p><hr/><br/><form><label>Target URL : </label><input type="text" name="targetURL"/><!--label Device name : --><!--input(type="text", name="devicename", size=10)--><!--label Password : --><!--input(type="password", name="pwd", size=10)--><input id="registerDevice" type="submit" value="Register"/><!--input(id="unregisterDevice", type="submit", value="Unregister")--></form><br/><br/><form><label>Generate n Contacts :</label><input type="text" name="nDocs" size="1"/><input id="insertDocs" type="image" src="./images/generate.png" alt="submit" height="50" width="50"/><!--input(id="insertDocs", type="submit", value="Generate")--><!--img(src="./images/generate.png", height="50", width="50")--></form><p>Share all my contacts ! <a href=""><img id="replicate" src="./images/share.jpg" height="60" width="60"/></a></p><br/><br/><!--p Extra : --><!--form--><!--	label Target URL : --><!--	input(type="text", name="targetURL", size=10)--><!--	input(id="registerDevice", type="submit", value="Unregister device")--><!----><p>Cancel all current replications : <a href=""><img id="cancel" src="./images/cancel.png" height="50" width="50"/></a></p><!--form--><!--	input(id="cancelReplication", type="submit", value="Cancel all replications")--><ul></ul><li> <a href="https://github.com/Gara64/cozy-plugdb">Github</a></li>');
}
return buf.join("");
};
});

require.register("views/app_view", function(exports, require, module) {
var Plug = require('../models/plug');
//var Device = require('../models/device');

module.exports = AppView = Backbone.View.extend({

    el: 'body',
    template: require('../templates/home'),
    events: {
    	"click #registerDevice" : "registerDevice",
    	"click #insertDocs": "createDocs",
    	"click #replicate" :"replicate",
    	"click #cancel": "cancelReplications"
	},

    render: function() {
    	var model = this.model;
        this.$el.html(this.template({status:model.get('status')}));
    	return this;
    }, 

    updateStatus: function() {
    	//this.$el.find('')
    },


    replicate: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.replicate(function(res) {
    		plug.set({status: res});
    	});
    },

    cancelReplications: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.cancelReplications(function(res) {
    		plug.set({status: res});
    	});
    },

    registerDevice: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.set({
    		target: this.$el.find('input[name="targetURL"]').val()
    	});

    	plug.register(function(res) {
    		plug.set({status: res});
    	});
    },


    createDocs: function(event) {
    	event.preventDefault();
    	var plug = this.model;
    	plug.set({nDocs: this.$el.find('input[name="nDocs"]').val()});
    	plug.generate(function(res) {
    		plug.set({status: res});
    	});
    },

/*
    	event.preventDefault();
    	var model = this.model;
    	model.urlRoot = 'plug/replicate/true';
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

    cancelReplications: function(event) {
    	event.preventDefault();
    	var model = this.model;
    	model.urlRoot = 'plug/replicate/false';
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
        var plug = new Plug({
        	target: this.$el.find('input[name="targetURL"]').val(), 
	 		password: this.$el.find('input[name="pwd"]').val(),
	 		devicename: this.$el.find('input[name="devicename"]').val()
        })
	    plug.urlRoot = 'plug/register/true';
	    plug.save({}, {
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
        var plug = new Plug({
        	target: this.$el.find('input[name="targetURL"]').val(), 
	 		password: this.$el.find('input[name="pwd"]').val(),
	 		devicename: this.$el.find('input[name="devicename"]').val()
        })
	    plug.urlRoot = 'plug/register/false';
	    plug.save({}, {
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
	    var plug = this.model;
        plug.set({nDocs: this.$el.find('input[name="nDocs"]').val()});
	    plug.urlRoot = 'plug/insert'; 

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
*/
	// initialize is automatically called once after the view is constructed
	initialize: function() {
	    //this.listenTo(this.collection, "insert", this.onInsertPlug);
	    this.model.on('change:status', this.render, this);
	},

	onInsertPlug: function(model) {
	    // re-render the view
	    this.render();
	}
});

});


//# sourceMappingURL=app.js.map