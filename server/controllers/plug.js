var plug = require('../lib/plug.js');
var async = require('async');
var log = require('printit')();
File = require('../models/files.js');
Note = require('../models/notes.js');
Device = require('../models/device.js');
Contact = require('../models/contacts.js');
//var request = require('request-json-light');
var request = require('request-json');
var request_new = require('request');
var basic = require('../lib/basic.js');

var init = false; //used to test plugDB connection

var remoteConfig = {
    cozyURL: "192.168.50.5",
    password: "cozycloud",
    login: "toto"
};

var couchUrl = "http://192.168.50.4:5984/";
var couchClient = request.newClient(couchUrl);
//var couchUrlTarget = "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/";

//var replicateRemoteURL = "https://toto:l9xvu7xpo1935wmidnoou9pvo893sorb@" + remoteConfig.cozyURL + "/cozy";



module.exports.main = function (req, res) {

    res.send(200);
    
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
   
    var msg;
    if(init) {
        msg = 'PlugDb already initialized';
        console.log(msg);
        res.send(500, {error: msg});
    }
    else {
        plug.init( function(err) {
            if(err){
                console.log(err);
                msg = "Init failed";
                res.send(500, {error: msg});
            }
            else{
                init = true;
                msg = "Init succeeded";
                console.log(msg);    
                res.send(200, req.body);
            }
            
        });
    }
};

module.exports.close = function(req, res) {
    var msg; 
    if(!init){
        msg = "PlugDB is not initialized";
        console.log(msg);
        res.send(500, {error: msg});
    }
    else {
        plug.close( function(err) {
            if(err){
                msg = "Closing failed";
                res.send(500, {error: msg});
            }
            else{
                init = false;
                msg = "Closed";
                res.send(200, req.body);
            }
            console.log(msg);
                
        });
    }
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
                if(init) {
                    insertPlug( function(ids) {
                        console.log(nDocs + " insert in plug done");
                        msg = "generation done";
                        res.send(200, req.body);
                    });
                }
                else{
                    msg = "generation done";
                    res.send(200, req.body);
                }
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

    console.log(req.params.bool);
    if(req.params.bool === 'true'){
        var repMode = req.body.repMode;
    
        var getIdsMode;
        if (repMode == "plug") 
            getIdsMode = selectPlug;
        else
            getIdsMode = getIdsContacts; 

        getIdsMode(function(ids) {
            replicateRemote(ids, function(err) {
                if(err)
                    res.send(500, {error: err});
                else
                    res.send(200, req.body);
            });
        });
    }
    else if(req.params.bool === 'false') {
        cancelReplication(function(err) {
            if(err)
                res.send(500, {error: err});
            else
                res.send(200, req.body);
        });
    }
    else
        res.redirect('back');

    

};

module.exports.register = function(req, res) {
    if(!init){
        console.log("PlugDB is not initialized");
        //res.redirect('back');
    }

    console.log("body : " + JSON.stringify(req.body));
    console.log("body2 : " + req.body);
    var deviceName = req.body.devicename;
    var target = req.body.target;
    var pwd = req.body.password;

    var config = {
        cozyURL: target,
        password: pwd,
        deviceName: deviceName
    }

    console.log('login : ' + config.deviceName);
    console.log('password : ' + config.password);
    console.log('cozyUrl : ' + config.cozyURL);

    console.log(req.params.bool)

    if(req.params.bool === 'true') {
        console.log('go register');
        registerRemote(config, function(err) {
            if(err){
                console.log(err);
                res.send(500, {error: err});
            }
            else{

                console.log('registration ok !');
                res.send(200, req.body);
            }
        });
    }
    //unregister device
    else if(req.params.bool === 'false'){
        unregisterDevice(config, function(err) {
            if(err){
                console.log(err);
                res.send(500, {error: err});
            }
            else{
                console.log('uregistration ok !');
                res.send(200, req.body);
            }
        });
    }
    else
        res.redirect('back');

}




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

/* !!! DEPRECATED (PASS THROUGH 5984 PORT) !!! 
See replicateRemote instead */
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

var cancelReplication = function(callback) {
 
    var activeTasks = function(_callback) {
        couchClient.get("_active_tasks", function(err, res, body){
            var repIds;
            if(err){
                console.error('Cannot get active tasks');
            }
            else if(body.length) {
                repIds = [];
                for (var i=0;i<body.length; i++) {
                    var rep = body[i];
                    repIds.push(rep.replication_id);
                }
            }
            _callback(err, repIds);
            
        });
    };

    activeTasks(function(err,repIds) {
        if(err)
            callback(err);
        else if(repIds) {
            for(var i=0;i<repIds.length;i++) {

                couchClient.post("_replicate", {replication_id: repIds[i], cancel:true}, function(err, res, body){
                    if(err || !body.ok){
                        console.log("Cancel replication failed");
                        callback(err);
                    }
                    else{
                        log.raw('Cancel replication ok');
                        callback();
                    }
                });
            }
        }
        else 
            callback();
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

    var remoteProxyClient = request.newClient("https://" + config.cozyURL);
    remoteProxyClient.setBasicAuth('owner', config.password);

    console.log('register ' + config.deviceName);
    console.log('mdp : ' + config.password)
    remoteProxyClient.post("device/", {login: config.deviceName}, function(err, response, body) {
        if (err) {
          callback(err);
        } else if (response.statusCode === 401 && response.reason) {
          callback('cozy need patch');
        } else if (response.statusCode === 401) {
          callback('wrong password');
        } else if (response.statusCode === 400) {
          callback('device name already exist');
        } else {
            console.log(body.id + " - " + body.password);
            //var fullURL = "https://" + config.cozyURL;
            Device = new Device({id:body.id, password: body.password, login: config.deviceName, url: config.cozyURL});
            callback();
            
        }
      });
  };

var replicateRemote = function(ids, callback) {

    console.log('url : ' + Device.url + ' - id : ' + Device.id);
    //var replicateRemoteURL = "https://toto:l9xvu7xpo1935wmidnoou9pvo893sorb@" + remoteConfig.cozyURL + "/cozy";
    var remoteURL = "https://" + Device.login + ":" + Device.password + "@" + Device.url + "/cozy";
    console.log(remoteURL);
    var data = { 
        source: "cozy",
        target:  remoteURL, // replicateRemoteURL, //contains credentials for a registered device.
        continuous: true,
        doc_ids: ids,
    };
    
    console.log("replication on ids " + ids);
    couchClient.post("_replicate", data, function(err, res, body){
        if(err || !body.ok){
            handleError(err, body, "Backup source failed ");
            callback(err);
        }
        else{
            log.raw('Backup source suceeded \o/');
            callback();
        }

    });
};

var checkCredentials = function(config, callback) {
    var remoteProxyClient = request.newClient("https://" + config.cozyURL);
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

var unregisterDevice = function (config, callback) {
    var remoteProxyClient = request.newClient("https://" + config.cozyURL);
    remoteProxyClient.setBasicAuth('owner', config.password);
    remoteProxyClient.del("device/#{Device.id}", function(err, res) {
        if(err) {
            callback(err)
        }
        else if(res.statusCode != 200)
            callback('Impossible to unregister the device');
        else
            callback();
    });
};

var testRemotePlug = function(callback) {
  
    var req = request_new.defaults({jar: true});
    var remoteClient = req.post({url: "https://paulsharing1.cozycloud.cc/login", qs: {username: "owner", password: "sharing1"}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else{
            req.post({url: "https://paulsharing1.cozycloud.cc/apps/plug/init"}, function(err, res, body) {
            if(err) 
                return console.error(err);
            else{
                console.log("code : " + res.statusCode);
                console.log("body : " + JSON.stringify(body));
            }
        });

        }
    });

    //remoteProxyClient.setBasicAuth('plug', 'kjc7mvznum8nz5mi85okwoo4de4gqfrp');

 /* var remoteProxyClient = request.newClient("https://paulsharing1.cozycloud.cc");

    remoteProxyClient.post('login', {username:'owner', password: 'sharing1'}, function(err, res, body) {
        if(err)
            console.log('error login: ' + err);
        else{
            console.log('ok login ' + res.statusCode);
            console.log('body : ' + JSON.stringify(body));
            var headers = res.headers;
            var cookie = headers["set-cookie"];

            remoteProxyClient.get('authenticated', {'Cookie' : cookie}, function(err, res, body) {
                if(err)
                    console.log('fail');
                else{
                    console.log('ok login ' + res.statusCode + ' body : ' + JSON.stringify(body) + ' - headers : ' + JSON.stringify(res.headers));
                    
                   // "_pk_id.1.b53c=bc95dad5da777bf5.1420724455.3.1422623068.1422018804.; express:sess=eyJwYXNzcG9ydCI6eyJ1c2VyIjoiYWRhYWY3Mjk1NmY0YTRkODkxZmVjODBlN2EwMDY1ZTQifX0=; express:sess.sig=viNPjxd06K-pH4x2rfax8tMTzTU"
                    //express:sess=eyJwYXNzcG9ydCI6e319; path=/; expires=Wed, 11 Feb 2015 11:16:05 GMT; secure; httponly,express:sess.sig=hDmS2dUGD1OKq22qiiaZz34qiGk; path=/; expires=Wed, 11 Feb 2015 11:16:05 GMT; secure; httponly
                }

            });
            
        }
    });*/


}
