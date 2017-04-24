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

require.register("collections/acls", function(exports, require, module) {
acl = require('../models/acl');
module.exports = ACLs = Backbone.Collection.extend({
    model: acl,
    url: 'acls',
});

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

require.register("models/acl", function(exports, require, module) {
module.exports = ACL = Backbone.Model.extend({
    urlRoot: 'acl',
    defaults: {
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
            url: 'plug/authFP',
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

require.register("models/rule", function(exports, require, module) {
module.exports = Rule = Backbone.Model.extend({
    urlRoot: 'rule',
    defaults: {
        docType: null,
        docAttr: null,
        docVal: null,
        subAttr: null,
        subVal: null,
    },

    create: function(callback) {
        $.ajax({
            url: 'rule',
            type: 'POST',
            data: {
                docType: this.get('docType'),
                docAttr: this.get('docAttr'),
                docVal: this.get('docVal'),
                subAttr: this.get('subAttr'),
                subVal: this.get('subVal')
            },

            success:function(result){
                callback("Create rule ok !");
            },
            error: function(result, response) {
                callback("Create rule failed !");
            }
        });
    },

});

});

require.register("router", function(exports, require, module) {
var AppView, PlugCollection, PlugModel, Router, plug, plugs;

AppView = require('views/app_view');

PlugCollection = require('collections/plugs');

PlugModel = require('models/plug');

plugs = new PlugCollection;

plug = new PlugModel;

module.exports = Router = Backbone.Router.extend({
  routes: {
    '': 'main',
    'insert': 'insertPlug'
  },
  main: function() {
    var mainView;
    mainView = new AppView({
      model: plug
    });
    mainView.render();
  },
  insertPlug: function() {}
});
});

;require.register("templates/acl", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div><h3>Suspicious ACL</h3><table><thead><tr class="titles"><th>Doc</th><th>Subject</th></tr></thead></table></div>');
}
return buf.join("");
};
});

require.register("templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Sharing control panel</h1><p>of my personal decentralized service system</p><p>Status :<strong id="status">' + escape((interp = status) == null ? '' : interp) + '</strong></p><hr/><br/><div id="plugBlock"><img id="imgplugdb" src="./images/plugdb.png" class="superpose"/><img id="imglock" src="./images/lock.png" height="50" width="50" class="superpose"/><br/><a href=""><input type="button" id="init" value="Init"/><input type="button" id="close" value="Close"/><input type="button" id="reset" value="Reset"/></a></div><div id="sharingBlock"><p class="formRow">1/ Authenticate on your PlugDB&nbsp;<a href=""><img id="authenticate" src="./images/authenticate.png" height="30" width="30"/></a></p><!--span Show contacts--><!--input#show-list(type=\'checkbox\')--><p>2/ Select shared contact</p><div id="myList"></div><br/><form autocomplete="on"><label>3/ Share my contacts with (URL) :</label><input id="targetURL" type="textfield" name="targetURL" value=""/><input id="replicateContacts" type="image" data-datatype="contact" src="./images/share.jpg" height="40" width="40"/></form><!--p.formRow 4/ Start sharing&nbsp;--><!--	a(href="" )--><!--img(id="replicateContacts", data-datatype="contact", src="./images/share.jpg", height="30", width="30")--><br/></div><div><h3>Create sharing rule</h3><form><div><label>What docs?</label><input type="text" name="doctype"/><label>Attr</label><input type="text" name="docattr"/><label>Value</label><input type="text" name="docval"/></div><div><label>With who?</label><label>Attr</label><input type="text" name="subattr"/><label>Value</label><input type="text" name="subval"/></div><input id="createRule" type="button" value="Ok"/></form></div><div id="acl"></div><hr/><br/><span>More tools</span><input id="toggle-more-tools" type="checkbox"/><!-- , checked=\'checked\'--><br/><br/><div id="more-tools"><form class="formRow"><label>Reset contacts & create&nbsp;</label><input type="text" name="nDocs" size="1" value="4"/><span>&nbsp;new ones called&nbsp;</span><input type="text" name="baseName" size="5" value="Alice"/><span>&nbsp;</span><input id="insertDocs" type="image" src="./images/generate.png" alt="submit" height="25" width="25"/><!--input(id="insertDocs", type="submit", value="Generate")--><!--img(src="./images/generate.png", height="50", width="50")--></form><br/><form class="formRow"><label>Add 1 contact named</label><input type="text" name="singleBaseName" size="5" value="Alice"/><span>&nbsp;</span><input id="insertSingleDoc" type="image" src="./images/add.png" alt="submit" height="25" width="25"/></form><p class="formRow">Cancel all current replications :<a href=""><img id="cancel" src="./images/cancel.png" height="25" width="25"/></a></p><!--p Extra :--><!--form--><!--	label Target URL :--><!--	input(type="text", name="targetURL", size=10)--><!--	input(id="registerDevice", type="submit", value="Unregister device")--><!----></div><!--p Share the selected contacts :--><!--	a(href="" )--><!--		img(id="replicateContacts", data-datatype="contact", src="./images/share.jpg", height="60", width="60")--><!--p Share all my photos !--><!--	a(href="" )--><!--		img(id="replicatePhotos", data-datatype="album", src="./images/share.jpg", height="60", width="60")<ul></ul><li><a href="https://github.com/Gara64/cozy-plugdb">Github</a></li>-->');
}
return buf.join("");
};
});

require.register("views/acl_view", function(exports, require, module) {
var ACLView, ContactListener, acl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

acl = require('../models/acl');

ContactListener = (function(_super) {
  __extends(ContactListener, _super);

  function ContactListener() {
    return ContactListener.__super__.constructor.apply(this, arguments);
  }

  ContactListener.prototype.models = {
    'acl': acl
  };

  return ContactListener;

})(CozySocketListener);

module.exports = ACLView = Backbone.View.extend({
  el: '#acl',
  template: require('../templates/acl'),
  initialize: function() {
    this.render();
  },
  render: function() {
    console.log('render acl view');
    this.$el.html(this.template());
  }
});
});

;require.register("views/app_view", function(exports, require, module) {
var AppView, Contact, ContactCollection, ContactListView, ContactListener, Plug, Rule, aclView, rule,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Plug = require('../models/plug');

Rule = require('../models/rule');

rule = new Rule();

aclView = require('./acl_view');

module.exports = AppView = Backbone.View.extend({
  el: 'body',
  template: require('../templates/home'),
  events: {
    'click #registerDevice': 'registerDevice',
    'click #insertDocs': 'createDocs',
    'click #replicateContacts': 'replicate',
    'click #replicatePhotos': 'replicate',
    'click #cancel': 'cancelReplications',
    'click #authenticate': 'authenticateFP',
    'click #init': 'initPlug',
    'click #close': 'closePlug',
    'click #reset': 'resetPlug',
    'click #insertSingleDoc': 'insertSingleDoc',
    'click #createRule': 'createRule'
  },
  render: function() {
    var model, myCollection, realtimer, view;
    model = this.model;
    this.$el.html(this.template());
    this.renderStatus();
    this.renderPlug();
    myCollection = new ContactCollection();
    myCollection.fetch({
      reset: true
    });
    realtimer = new ContactListener();
    realtimer.watch(myCollection);
    view = new ContactListView({
      el: '#myList',
      collection: myCollection
    });
    aclView = new aclView();
    return this;
  },
  renderStatus: function() {
    var model;
    model = this.model;
    return this.$el.html(this.template({
      status: model.get('status')
    }));
  },
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
  createRule: function(event) {
    event.preventDefault();
    rule.set({
      docType: this.$el.find('input[name="doctype"]').val()
    });
    rule.set({
      docAttr: this.$el.find('input[name="docattr"]').val()
    });
    rule.set({
      docVal: this.$el.find('input[name="docval"]').val()
    });
    rule.set({
      subAttr: this.$el.find('input[name="subattr"]').val()
    });
    rule.set({
      subVal: this.$el.find('input[name="subval"]').val()
    });
    return rule.create(function(res) {
      return console.log('res : ', res);
    });
  },
  initialize: function() {
    var _this;
    _this = this;
    this.getPlugStatus(function() {
      return _this.renderPlug(_this);
    });
    this.model.on('change:status', this.render, this);
    this.model.on('change:auth', this.render, this);
    this.model.on('change:init', this.render, this);
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

  ContactListView.prototype.initialize = function() {
    this.listenTo(this.collection, 'change', this.render);
    this.listenTo(this.collection, 'add', this.render);
    this.listenTo(this.collection, 'remove', this.render);
    this.listenTo(this.collection, 'reset', this.render);
    return console.log(this.el);
  };

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

;
//# sourceMappingURL=app.js.map