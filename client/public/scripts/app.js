(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
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
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
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
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
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

require.register("collections/sharingRules", function(exports, require, module) {
var SharingRule, SharingRuleCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SharingRule = require('../models/sharingRule');

module.exports = SharingRuleCollection = (function(_super) {
  __extends(SharingRuleCollection, _super);

  function SharingRuleCollection() {
    return SharingRuleCollection.__super__.constructor.apply(this, arguments);
  }

  SharingRuleCollection.prototype.model = SharingRule;

  SharingRuleCollection.prototype.url = 'sharingrule';

  return SharingRuleCollection;

})(Backbone.Collection);
});

;require.register("initialize", function(exports, require, module) {
// The function called from index.html
$(document).ready(function() {
    var app = require('application');
    app.initialize()
});

});

require.register("lib/base_view", function(exports, require, module) {
var BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    return BaseView.__super__.constructor.apply(this, arguments);
  }

  BaseView.prototype.template = function() {};

  BaseView.prototype.initialize = function() {};

  BaseView.prototype.getRenderData = function() {
    var _ref;
    return {
      model: (_ref = this.model) != null ? _ref.toJSON() : void 0
    };
  };

  BaseView.prototype.render = function() {
    this.beforeRender();
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  };

  BaseView.prototype.beforeRender = function() {};

  BaseView.prototype.afterRender = function() {};

  BaseView.prototype.destroy = function() {
    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    return Backbone.View.prototype.remove.call(this);
  };

  return BaseView;

})(Backbone.View);
});

;require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(_super) {
  __extends(ViewCollection, _super);

  function ViewCollection() {
    this.removeItem = __bind(this.removeItem, this);
    this.addItem = __bind(this.addItem, this);
    return ViewCollection.__super__.constructor.apply(this, arguments);
  }

  ViewCollection.prototype.itemview = null;

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.template = function() {
    return '';
  };

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.collectionEl = null;

  ViewCollection.prototype.onChange = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    return this.$collectionEl.append(view.el);
  };

  ViewCollection.prototype.initialize = function() {
    var collectionEl;
    ViewCollection.__super__.initialize.apply(this, arguments);
    this.views = {};
    this.listenTo(this.collection, "reset", this.onReset);
    this.listenTo(this.collection, "add", this.addItem);
    this.listenTo(this.collection, "remove", this.removeItem);
    if (this.collectionEl == null) {
      return collectionEl = el;
    }
  };

  ViewCollection.prototype.render = function() {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var id, view, _ref;
    this.$collectionEl = $(this.collectionEl);
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      this.appendView(view.$el);
    }
    this.onReset(this.collection);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.remove = function() {
    this.onReset([]);
    return ViewCollection.__super__.remove.apply(this, arguments);
  };

  ViewCollection.prototype.onReset = function(newcollection) {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.remove();
    }
    return newcollection.forEach(this.addItem);
  };

  ViewCollection.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemview(options);
    this.views[model.cid] = view.render();
    this.appendView(view);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.removeItem = function(model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
    return this.onChange(this.views);
  };

  return ViewCollection;

})(BaseView);
});

;require.register("models/device", function(exports, require, module) {
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
        baseName:null,
        status: null,
        devicename: null,
        target: null,
        password: null,
        dataType: null,
        auth: false,
        init: false,
        ids: null
    },

    replicate: function(callback) {
        $.ajax({
            url: 'plug/replicate/true',
            type: 'POST',
            data: {
                dataType: this.get('dataType'),
                target: this.get('target')
            },
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
                //callback("Cancel failed !");
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
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
            url: 'plug/generate',
            type: 'POST',
            data: {
                nDocs: this.get('nDocs'),
                baseName: this.get('baseName')
            },
            success:function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    init: function(callback) {
        $.ajax({
            url: 'plug/init',
            type: 'POST',
            success:function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    close: function(callback) {
        $.ajax({
            url: 'plug/close',
            type: 'POST',
            success:function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    reset: function(callback) {
        $.ajax({
            url: 'plug/reset',
            type: 'POST',
            success:function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    authenticateFP: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/authenticate', 
            type: 'POST',
            success: function(result){
                callback(result, true);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error, false);
            }
        });
    },

    select: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/select',
            type: 'GET',
            success: function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error);
            }
        });
    },

    insert: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/insert',
            type: 'POST',
            data: {
                baseName: this.get('baseName')
            },
            success: function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error);
            }
        });
    },

    status: function(callback) {
        _this = this;
        $.ajax({
            url: 'plug/status',
            type: 'GET',
            success: function(result){
                callback(result);
            },
            error: function(result, response) {
                var txt = JSON.parse(result.responseText);
                callback(txt.error);
            }
        });
    }


});

});

require.register("models/sharingRule", function(exports, require, module) {
var SharingRule,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = SharingRule = (function(_super) {
  __extends(SharingRule, _super);

  function SharingRule() {
    return SharingRule.__super__.constructor.apply(this, arguments);
  }

  SharingRule.prototype.rootUrl = 'sharingurl';

  SharingRule.prototype.defaults = {
    docType: "sharingRule"
  };

  return SharingRule;

})(Backbone.Model);
});

;require.register("router", function(exports, require, module) {
var AppView, Router, SharingRuleCollection;

AppView = require('views/app_view');

SharingRuleCollection = require('collections/sharingRules');

module.exports = Router = Backbone.Router.extend({
  routes: {
    '': 'main'
  },
  main: function() {
    var mainView;
    mainView = new AppView({
      collection: new SharingRuleCollection()
    });
    return mainView.render();
  }
});
});

;require.register("templates/addSharingRule", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<p>Enter your sharing rule :</p><form><label>Name :</label><input type=\"text\" id=\"ruleName\" size=\"10\"/><br/><label>Filter Doc :</label><textarea rows=\"3\" cols=\"75\" id=\"filterDoc\"></textarea><label>User Description :</label><input type=\"text\" id=\"docUserDesc\" size=\"10\"/><br/><label>Filter User :</label><textarea rows=\"3\" cols=\"75\" id=\"filterUser\"></textarea><label>User Description :</label><input type=\"text\" id=\"userUserDesc\" size=\"10\"/><br/><input id=\"submitRule\" type=\"submit\" value=\"Submit\"/></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/home", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),status = locals_.status;
buf.push("<h1>Sharing control panel</h1><p>of my personal decentralized service system</p><p>Status :<strong id=\"status\">" + (jade.escape((jade_interp = status) == null ? '' : jade_interp)) + "</strong></p><hr/><br/><div id=\"plugBlock\"><img id=\"imgplugdb\" src=\"./images/plugdb.png\" class=\"superpose\"/><img id=\"imglock\" src=\"./images/lock.png\" height=\"50\" width=\"50\" class=\"superpose\"/><br/><a href=\"\"><input type=\"button\" id=\"init\" value=\"Init\"/><input type=\"button\" id=\"close\" value=\"Close\"/><input type=\"button\" id=\"reset\" value=\"Reset\"/></a></div><div id=\"sharingBlock\"><p class=\"formRow\">1/ Authenticate on your PlugDB&nbsp;<a href=\"\"><img id=\"authenticate\" src=\"./images/authenticate.png\" height=\"30\" width=\"30\"/></a><!--label Device name :--><!--input(type=\"text\", name=\"devicename\", size=10)--><!--label Password :--><!--input(type=\"password\", name=\"pwd\", size=10)--></p><!--span Show contacts--><!--input#show-list(type='checkbox')--></div><p>Sharing rules</p><div id=\"sharingrules-list\"><!--p 2/ Select shared contact--><!--#myList--><!--br--><!--form--><!--\tlabel 3/ Share my contacts with (URL) :--><!--\tinput(id=\"targetURL\", type=\"text\", name=\"targetURL\")--><!--p.formRow 4/ Start sharing&nbsp;--><!--\ta(href=\"\" )--><!--\t\timg(id=\"replicateContacts\", data-datatype=\"contact\", src=\"./images/share.jpg\", height=\"30\", width=\"30\")--></div><hr/><br/><span>More tools</span><input id=\"toggle-more-tools\" type=\"checkbox\"/><br/><br/><div id=\"more-tools\"><form class=\"formRow\"><label>Reset contacts & create&nbsp;</label><input type=\"text\" name=\"nDocs\" size=\"1\" value=\"4\"/><span>&nbsp;new ones called&nbsp;</span><input type=\"text\" name=\"baseName\" size=\"5\" value=\"Alice\"/><span>&nbsp;</span><input id=\"insertDocs\" type=\"image\" src=\"./images/generate.png\" alt=\"submit\" height=\"25\" width=\"25\"/><!--input(id=\"insertDocs\", type=\"submit\", value=\"Generate\")--><!--img(src=\"./images/generate.png\", height=\"50\", width=\"50\")--></form><br/><form class=\"formRow\"><label>Add 1 contact named</label><input type=\"text\" name=\"singleBaseName\" size=\"5\" value=\"Alice\"/><span>&nbsp;</span><input id=\"insertSingleDoc\" type=\"image\" src=\"./images/add.png\" alt=\"submit\" height=\"25\" width=\"25\"/></form><p class=\"formRow\">Cancel all current replications :<a href=\"\"><img id=\"cancel\" src=\"./images/cancel.png\" height=\"25\" width=\"25\"/></a></p><!--p Extra :--><!--form--><!--\tlabel Target URL :--><!--\tinput(type=\"text\", name=\"targetURL\", size=10)--><!--\tinput(id=\"registerDevice\", type=\"submit\", value=\"Unregister device\")--><!----></div><!--p Share the selected contacts :--><!--\ta(href=\"\" )--><!--\t\timg(id=\"replicateContacts\", data-datatype=\"contact\", src=\"./images/share.jpg\", height=\"60\", width=\"60\")--><!--p Share all my photos !--><!--\ta(href=\"\" )--><!--\t\timg(id=\"replicatePhotos\", data-datatype=\"album\", src=\"./images/share.jpg\", height=\"60\", width=\"60\")--><label>Add a sharing rule</label><input id=\"addRule\" type=\"image\" src=\"./images/add.png\" alt=\"submit\" height=\"25\" width=\"25\"/><div id=\"createRule\"></div><ul></ul><a href=\"https://github.com/Gara64/cozy-plugdb\">Github</a>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/sharingRule", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),sharingRule = locals_.sharingRule;
buf.push("<h3>" + (jade.escape((jade_interp = sharingRule.name) == null ? '' : jade_interp)) + "</h3><p>FilterDoc : " + (jade.escape((jade_interp = sharingRule.filterDoc.rule) == null ? '' : jade_interp)) + "</p><p>FilterUser: " + (jade.escape((jade_interp = sharingRule.filterUser.rule) == null ? '' : jade_interp)) + "</p><img id=\"deleteRule\" src=\"./images/cancel.png\" height=\"25\" width=\"25\"/>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/addSharingRuleView", function(exports, require, module) {
var AddSharingRuleView, SharingRule;

SharingRule = require('../models/sharingRule');

module.exports = AddSharingRuleView = Backbone.View.extend({
  template: require('../templates/addSharingRule'),
  tagName: 'div',
  events: {
    'click #submitRule': 'submitRule'
  },
  render: function() {
    this.$el.html(this.template());
    return console.log('add rule');
  },
  submitRule: function() {
    var dUserDesc, fDoc, fUser, filterDoc, filterUser, name, newRule, uUserDesc;
    name = $('#ruleName').val();
    fDoc = $('#filterDoc').val();
    dUserDesc = $('#docUserDesc').val();
    fUser = $('#filterUser').val();
    uUserDesc = $('#userUserDesc').val();
    if (this.checkAttributes(name, fDoc, fUser)) {
      filterDoc = {
        rule: fDoc,
        userDesc: dUserDesc
      };
      filterUser = {
        rule: fUser,
        userDesc: uUserDesc
      };
      newRule = new SharingRule({
        name: name,
        filterDoc: filterDoc,
        filterUser: filterUser
      });
      newRule.save();
      this.collection.add(newRule);
      this.remove();
      return this.render();
    } else {
      return alert('Please enter all mandatory fields');
    }
  },
  checkAttributes: function(name, filterDoc, filterUser) {
    return (name != null) && (filterDoc != null) && (filterUser != null);
  }
});
});

;require.register("views/app_view", function(exports, require, module) {
var AddSharingRuleView, AppView, Contact, ContactCollection, ContactListView, ContactListener, Plug, SharingRuleView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Plug = require('../models/plug');

SharingRuleView = require('./sharingRuleView');

AddSharingRuleView = require('./addSharingRuleView');

module.exports = AppView = Backbone.View.extend({
  el: 'body',
  template: require('../templates/home'),
  events: {
    'click #registerDevice': 'registerDevice',
    'click #insertDocs': 'createDocs',
    'click #replicateContacts': 'replicate',
    'click #replicatePhotos': 'replicate',
    'click #authenticate': 'authenticateFP',
    'click #init': 'initPlug',
    'click #close': 'closePlug',
    'click #reset': 'resetPlug',
    'click #addRule': 'addRule',
    'click #deleteRule': 'deleRule'
  },
  render: function() {
    var model;
    model = this.model;
    this.$el.html(this.template());
    this.collection.fetch();
    return this.collection.forEach(function(sharingRule) {
      return this.onRuleAdded(sharingRule);
    });
  },
  onRuleAdded: function(sharingRule) {
    var ruleView;
    ruleView = new SharingRuleView({
      model: sharingRule
    });
    ruleView.render();
    this.$el.find('ul').append(ruleView.$el);
    return this;
  },
  addRule: function() {
    var addRuleView;
    addRuleView = new AddSharingRuleView();
    addRuleView.render();
    this.$('#createRule').empty();
    return this.$('#createRule').append(addRuleView.$el);
  },
  renderStatus: function() {},
  renderPlug: function() {
    var isAuth, isInit, model;
    model = this.model;
    isInit = model.get('init');
    console.log('is init : ' + isInit);
    $('#plugBlock').css('border-color', isInit ? 'green' : 'red');
    isAuth = model.get('auth');
    if (isAuth) {
      $('#myList').css('display', 'block');
      this.render;
    } else {
      $('#myList').css('display', 'none');
    }
    return this;
  },
  updateStatus: function() {},
  getPlugStatus: function(callback) {
    var plug;
    plug = this.model;
    plug.status(function(res) {
      console.log('init : ' + res.init);
      console.log('auth : ' + res.auth);
      plug.set({
        init: res.init
      });
      plug.set({
        auth: res.auth
      });
      return callback;
    });
  },
  replicate: function(event) {
    var dataType, plug, target;
    event.preventDefault();
    plug = this.model;
    dataType = $(event.currentTarget).data('datatype');
    target = this.$el.find('input[name="targetURL"]').val();
    if (target === '') {
      alert('Please type the target URL');
      return;
    }
    if (!plug.get('auth')) {
      alert('Please authenticate first');
      return;
    }
    plug.set({
      dataType: dataType
    });
    plug.set({
      target: target
    });
    plug.replicate(function(res) {
      plug.set({
        status: res
      });
    });
  },
  cancelReplications: function(event) {
    var plug;
    event.preventDefault();
    plug = this.model;
    plug.cancelReplications(function(res) {
      plug.set({
        status: res
      });
    });
  },
  registerDevice: function(event) {
    var plug;
    event.preventDefault();
    plug = this.model;
    plug.set({
      target: this.$el.find('input[name="targetURL"]').val()
    });
    plug.register(function(res) {
      plug.set({
        status: res
      });
    });
  },
  createDocs: function(event) {
    var plug;
    event.preventDefault();
    plug = this.model;
    plug.set({
      nDocs: this.$el.find('input[name="nDocs"]').val()
    });
    plug.set({
      baseName: this.$el.find('input[name="baseName"]').val()
    });
    plug.set({
      status: 'Generation of the documents...'
    });
    plug.generate(function(res) {
      plug.set({
        status: res
      });
    });
  },
  initPlug: function(event) {
    var plug;
    event.preventDefault();
    plug = this.model;
    plug.set({
      status: 'Initialization...'
    });
    plug.init(function(res, init) {
      plug.set({
        status: res
      });
      plug.set({
        init: init
      });
    });
  },
  closePlug: function(event) {
    var plug;
    event.preventDefault();
    plug = this.model;
    plug.set({
      status: 'Shut down...'
    });
    plug.close(function(res, closed) {
      plug.set({
        status: res
      });
      plug.set({
        auth: !closed
      });
      plug.set({
        init: !closed
      });
    });
  },
  resetPlug: function(event) {
    var plug;
    event.preventDefault();
    plug = this.model;
    plug.set({
      status: 'Restart plugDB...'
    });
    plug.reset(function(res, reset) {
      plug.set({
        status: res
      });
      plug.set({
        auth: !reset
      });
      plug.set({
        init: reset
      });
    });
  },
  authenticateFP: function(event) {
    var plug, _this;
    event.preventDefault();
    _this = this;
    plug = this.model;
    plug.set({
      status: 'Authentication...'
    });
    plug.authenticateFP(function(res, authenticated) {
      plug.set({
        status: res
      });
      plug.set({
        auth: authenticated
      });
      if (!authenticated) {
        _this.getPlugStatus();
      } else {
        plug.set({
          init: true
        });
      }
    });
  },
  insertSingleDoc: function(event) {
    var plug, _this;
    event.preventDefault();
    _this = this;
    plug = this.model;
    plug.set({
      baseName: this.$el.find('input[name="singleBaseName"]').val()
    });
    plug.set({
      status: 'Insertion of a new contact...'
    });
    plug.insert(function(res) {
      plug.set({
        status: res
      });
    });
  },
  initialize: function() {
    var _this;
    _this = this;
    this.listenTo(this.collection, "add", this.onRuleAdded);
  },
  onInsertPlug: function(model) {
    this.render();
  }
});

Contact = (function(_super) {
  __extends(Contact, _super);

  function Contact() {
    return Contact.__super__.constructor.apply(this, arguments);
  }

  return Contact;

})(Backbone.Model);

ContactCollection = (function(_super) {
  __extends(ContactCollection, _super);

  function ContactCollection() {
    return ContactCollection.__super__.constructor.apply(this, arguments);
  }

  ContactCollection.prototype.model = Contact;

  ContactCollection.prototype.url = 'contacts';

  return ContactCollection;

})(Backbone.Collection);

ContactListener = (function(_super) {
  __extends(ContactListener, _super);

  function ContactListener() {
    return ContactListener.__super__.constructor.apply(this, arguments);
  }

  ContactListener.prototype.models = {
    'contact': Contact
  };

  ContactListener.prototype.events = ['contact.create', 'contact.update', 'contact.delete'];

  ContactListener.prototype.onRemoteCreate = function(model) {
    return this.collection.add(model);
  };

  ContactListener.prototype.onRemoteDelete = function(model) {
    return this.collection.remove(model);
  };

  return ContactListener;

})(CozySocketListener);

ContactListView = (function(_super) {
  __extends(ContactListView, _super);

  function ContactListView() {
    this.render = __bind(this.render, this);
    this.renderOne = __bind(this.renderOne, this);
    return ContactListView.__super__.constructor.apply(this, arguments);
  }

  ContactListView.prototype.events = {
    "change": "onChange"
  };

  ContactListView.prototype.onChange = function(e) {
    var model;
    console.log(e.target);
    e.preventDefault();
    if (e.target.type === "checkbox") {
      model = this.collection.get(e.target.id);
      return model.save({
        shared: !model.get('shared')
      }, {
        wait: true
      });
    } else {
      return this.handleInputChange(e.target);
    }
  };

  ContactListView.prototype.handleInputChange = function(elt) {
    var data, firstName, lastName, model, note, parent;
    console.log("handleInputChange !");
    parent = elt.parentElement.parentElement;
    firstName = parent.children[0].children[0].value;
    lastName = parent.children[1].children[0].value;
    note = parent.children[2].children[0].value;
    data = {
      n: lastName + ";" + firstName + ";;;",
      fn: firstName + " " + lastName,
      note: note
    };
    model = this.collection.get(parent.id);
    return model.save(data, {
      wait: true
    });
  };

  ContactListView.prototype.initialize = function() {};

  ContactListView.prototype.renderOne = function(model) {
    var checked, id, n;
    checked = model.get('shared') ? "checked='checked'" : '';
    n = model.get('n');
    if (n) {
      n = n.split(';');
    } else {
      n = [model.get('fn'), ''];
    }
    id = model.get('id');
    return "<tr class='contac-row' id=" + id + ">\n   <!-- <td role=\"id\">" + id + "</td> -->\n    <td role=\"fn\"><input value=\"" + n[1] + "\"></input></td>\n    <td role=\"ln\"><input value=\"" + n[0] + "\"></input></td>\n    <td role=\"pn\"><input value=\"" + (model.get('note')) + "\"></input></td>\n    <td><input type=\"checkbox\" id=\"" + id + "\" " + checked + "></td>\n</tr>";
  };

  ContactListView.prototype.render = function() {
    var html;
    html = "<table>\n<thead>\n<tr class=\"titles\">\n   <!-- <td>ID</td> -->\n    <td role=\"ln\">Last name</td>\n    <td role=\"fn\">First name</td>\n    <td role=\"pn\">Note</td>\n    <td>Shared</td>\n</tr>\n</thead>";
    this.collection.forEach((function(_this) {
      return function(model) {
        return html += _this.renderOne(model);
      };
    })(this));
    html += '</table>';
    return this.$el.html(html);
  };

  return ContactListView;

})(Backbone.View);
});

;require.register("views/sharingRuleView", function(exports, require, module) {
var SharingRuleView;

module.exports = SharingRuleView = Backbone.View.extend({
  template: require('../templates/sharingRule'),
  tagName: 'div',
  render: function() {

    /*
    @collection.forEach (model) =>
    
        html += @renderOne model
    
    html += '</table>'
    @$el.html(html)
     */
    this.$el.html(this.template({
      sharingRule: this.model.toJSON()
    }));
    return console.log('collection sharing rule: ' + JSON.stringify(this.model));
  },
  initialize: function() {}
});
});

;
//# sourceMappingURL=app.js.map