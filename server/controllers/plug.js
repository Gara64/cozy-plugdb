var plug = require('../lib/plug.js');
var async = require('async');
var log = require('printit')();
File = require('../models/files.js');
Note = require('../models/notes.js');
Contact = require('../models/contacts.js');
var request = require('request-json-light');
var basic = require('../lib/basic.js');

var init = false; //used to test plugDB connection

var remoteConfig = {
    cozyURL: "192.168.50.5",
    password: "cozycloud"
};

var couchUrl = "http://192.168.50.4:5984/";
var couchClient = request.newClient(couchUrl);
var couchUrlTarget = "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/";

var remoteProxyClient = request.newClient("https://" + remoteConfig.cozyURL);

var replicateRemoteURL = "https://toto:l9xvu7xpo1935wmidnoou9pvo893sorb@" + remoteConfig.cozyURL + "/cozy";


module.exports.main = function (req, res) {

    cancelReplication();
   /* getIdsContacts(function(ids) {
        replicateRemote(ids, remoteConfig, function(err) {
            if(err)
                console.log("fail");
            else
                console.log("success, gg");
        });
    });*/
    

    res.render('index.jade'), function(err, html) {
        res.send(200, html);
};
    
    
    /* This is the whole demo flow :
    plug.init(function() {
        deleteAllFiles(function() {
            createNotes(2, function() {
                insertPlug(getIdsNotes, function(ids) {
                    replicateDocs(ids);
                    closePlug();
                });
            });
        });
    });
    */

};

module.exports.init = function(req, res) {
    if(init) {
        console.log('PlugDb already initialized');
        res.redirect('back');
    }

   console.log("oki");
    plug.init( function(err) {
        var msg;
        if(err){
            console.log(err);
            msg = "Init failed";
        }
        else{
            init = true;
            msg = "Init succeeded";
        }
        console.log(msg);    
        res.render('index.jade', {status: msg}, function(err, html){
            res.send(200, html);
        });
    });
};

module.exports.insert = function(req, res) {
    var msg;
    if(!init){
        console.log("PlugDB not initialized");
        msg = "PlugDB not initialized :/";
    }
    //else {

        var nDocs = req.body.nDocs;
       // var nDocs = req.params.ndocs;
        console.log("n contacts : " + nDocs);
        deleteAllContacts(function() {
            createContacts(nDocs, function() {
               /* insertPlug( function(ids) {
                    console.log(nDocs + " insert in plug done");
                   */
                    msg = "insert done";
                    res.send(200);
                //});
            });
        });
   // }

};


module.exports.replicate = function(req, res) {

    var msg;
    if(!init){
        console.log("PlugDB not initialized");
        msg = "PlugDB not initialized :/";
        //res.redirect('back');
    }

    var repMode = req.body.repMode;
    
    var getIdsMode;
    if (repMode == "plug") 
        getIdsMode = selectPlug;
    else
        getIdsMode = getIdsContacts; 

    getIdsMode(function(ids) {
        replicateDocs(ids, function() {
                res.render('index.jade', {status:"Replication done !"}, function(err, html){
                    res.send(200, html);

            });
        });
    });

};


module.exports.close = function(req, res) {
    if(!init){
        console.log("PlugDB is not initialized");
        res.redirect('back');
    }
    plug.close( function(err) {
        if(err){
            msg = "Closing failed";
        }
        else{
            msg = "Closed"
        }
        console.log(msg);
        res.render('index.jade', {status: msg}, function(err, html){
            res.send(200, html);
        });
    });
};

var createFiles = function(nDocs) {
	for(var i=0;i<nDocs;i++){
		var docName = "gen_doc_" + i;
		File.create({"name":"test", "content":"doc"}, function(err, file) {
			if(err)
	    		console.error(err);
	    	else
	    		log.raw('file created : ' + file.id);
		});
	}
};

var createNotes = function(nNotes, callback) {
	var create = function(nNotes,cback) {
    for(var i=0;i<nNotes;i++){
		var noteName = "gen_note_" + i;
        var contentText = "coucou " + i;
        var path = [];
        path.push(noteName);
		Note.create({title:noteName, parent_id:'tree-node-all', version:1, content:contentText}, function(err, note) {
			if(err)
	    		console.error(err);
	    	else{
	    		log.raw('note created : ' + note.id);
	        }	
        });
    }
    cback(nNotes); 
    };

    create(nNotes, function() {
        callback();
    });
};

var createContacts = function(nContacts, callback) {
    for(var i=0;i<nContacts;i++) {
        var contactName = "contact " + i;
        var datapoint = new Array();

        Contact.create({fn: contactName, datapoints: datapoint }, function(err, contact) {
            if(err)
                console.error(err);
            else{
                log.raw('contact created : ' + contact.id);
            }
        });
    }
    callback();
};


var getFiles = function(callback, target) {
	// Getting request results
	File.request("all", function (err, files) {
		if(err)
			console.error(err);
		else{
			var ids = [];
		    for(var i=0;i<files.length;i++){
		    	ids.push(files[i].id);
		    }
	   		callback(ids, target);
	   	}
	});
};

var getIdsNotes = function(callback) {
	// Getting request results
	Note.request("all", function (err, files) {
		if(err){
			console.error(err);
            return;
		}
        else{
			var ids = [];
		    for(var i=0;i<files.length;i++){
		    	ids.push(files[i].id);
		    }
	   	    callback(ids);
        }
	});
};

var getIdsContacts = function(callback) {
    // Getting request results
    Contact.request("all", function (err, contacts) {
        if(err){
            console.error(err);
            return;
        }
        else{
            var ids = [];
            for(var i=0;i<contacts.length;i++){
                ids.push(contacts[i].id);
            }
            callback(ids);
        }
    });
};

var insertPlug = function(callback) {
    getIdsNotes(function(ids) {
        console.log("insert in plug: " + ids);
	    plug.insert(ids, function(){
		    callback(ids);
	    });
    });
};

var selectPlug = function(callback) {
	    plug.select(function(result){
		    console.log("ids : " + result);
            callback(result);
    });
};

var deleteAllFiles = function(callback, nDocs) {
	File.requestDestroy("all", function(err) {
		if(err)
    		log.raw(err);
    	else
    		log.raw("all files deleted");
    	callback(nDocs);
	});
};

var deleteAllNotes = function( callback) {
	Note.requestDestroy("all", function(err) {
		if(err)
    		log.raw(err);
    	else
    		log.raw("all notes deleted");
    	callback();
	});
};

var deleteAllContacts = function(callback) {
    Contact.requestDestroy("all", function(err) {
        if(err)
            log.raw(err);
        else
            log.raw("all notes deleted");
        callback();
    });
};

var replicateDocs = function(ids, callback) {

    
	var repSourceToTarget = { 
		source: "cozy", 
		target: "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/cozy",
        continuous: true,
        //cancel: true,
        doc_ids: ids
    };
    var couchTarget = request.newClient(couchUrlTarget);
	var repTargetToSource = { 
		source: "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/cozy", 
		target: "http://192.168.50.4:5984/cozy",
        continuous: true,
        //cancel: true,
        doc_ids: ids
    };
    console.log("replication on ids " + ids);
	couchClient.post("_replicate", repSourceToTarget, function(err, res, body){
		if(err || !body.ok)
			handleError(err, body, "Backup source failed ");
		else{
			log.raw('Backup source suceeded \o/');
			log.raw(body);
            callback();
		}
	});
	couchTarget.post("_replicate", repTargetToSource, function(err, res, body){
		if(err || !body.ok)
			handleError(err, body, "Backup target failed ");
		else{
			log.raw('Backup target suceeded \o/');
			log.raw(body);
		}
	});

};

var cancelReplication = function() {
 
    var activeTasks = function(callback) {
        couchClient.get("_active_tasks", function(err, res, body){
            if(err)
                console.error('Cannot get active tasks');
            else {
                var repIds = [];
                for (var i=0;i<body.length; i++) {
                    var rep = body[i];
                    repIds.push(rep.replication_id);
                }
            }
            callback(repIds);
        });
    };

    activeTasks(function(repIds) {
        for(var i=0;i<repIds.length;i++) {

            couchClient.post("_replicate", {replication_id: repIds[i], cancel:true}, function(err, res, body){
                if(err || !body.ok)
                    handleError(err, body, "Cancel replication failed");
                else{
                    log.raw('Cancel replication ok');
                    log.raw(body);
                }
            });
        }
    });
};



var handleError = function(err, body, msg) {
    log.error("An error occured:");
    if (err) {
      log.raw(err);
    }
    log.raw(msg);
    if (body != null) {
      if (body.msg != null) {
        log.raw(body.msg);
      } else if (body.error != null) {
        if (body.error.message != null) {
          log.raw(body.error.message);
        }
        if (body.message != null) {
          log.raw(body.message);
        }
        if (body.error.result != null) {
          log.raw(body.error.result);
        }
        if (body.error.code != null) {
          log.raw("Request error code " + body.error.code);
        }
        if (body.error.blame != null) {
          log.raw(body.error.blame);
        }
        if (typeof body.error === "string") {
          log.raw(body.error);
        }
        if (body.reason != null )
        	log.raw(body.reason);
      } else {
        log.raw(body);
      }
    }
    return process.exit(1);
  };


var registerRemote = function(config, callback) {

    remoteProxyClient.setBasicAuth('owner', config.password);
    return remoteProxyClient.post("device/", {login: 'toto'}
    
    , (function(_this) {
      return function(err, response, body) {
        if (err) {
          return callback(err);
        } else if (response.statusCode === 401 && response.reason) {
          return callback(new Error('cozy need patch'));
        } else if (response.statusCode === 401) {
          return callback(new Error('wrong password'));
        } else if (response.statusCode === 400) {
          return callback(new Error('device name already exist'));
        } else {
            console.log(body.id + " - " + body.password);
          //return _this.config.save(config, callback);
        }
      };
    })(this));
  };

var replicateRemote = function(ids, config, callback) {


    //deviceRemoteClient.setBasicAuth('owner', config.password);
    var data = { 
        source: "cozy",
        target: replicateRemoteURL,
        doc_ids: ids
    };
    
    console.log("replication on ids " + ids);
    couchClient.post("_replicate", data, function(err, res, body){
        if(err || !body.ok)
            handleError(err, body, "Backup source failed ");
        else{
            log.raw('Backup source suceeded \o/');
            log.raw(body);
        }
        callback(err);

    });
  };

var checkCredentials = function(config, callback) {
    return remoteProxyClient.post("login", {
        username: 'owner',
        password: config.password
      }
    , function(err, response, body) {
      var error;
      if ((response != null ? response.statusCode : void 0) !== 200) {
        error = (err != null ? err.message : void 0) || body.error || body.message;
      } else {
        error = null;
      }
      return callback(error);
    });
};

var unregisterDevice = function (options, callback) {
    remoteProxyClient.setBasicAuth('owner', config.password);
    remoteProxyClient.del("device/#{options.deviceId}/", callback());
};
