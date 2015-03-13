var async = require('async');
var log = require('printit')();
File = require('../models/files.js');
Note = require('../models/notes.js');
Device = require('../models/device.js');
Contact = require('../models/contacts');
cozydb = require('cozydb');


Photo = require('../models/photo.js');
Album = require('../models/album');

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
var couchUrlTarget = "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/cozy";
var couchRemoteClient = request.newClient(couchUrlTarget);

module.exports.main = function (req, res) {
    res.send(200);
};


module.exports.insert = function(req, res) {
    var msg;
    if(!init){
        console.log("PlugDB not initialized");
        msg = "PlugDB not initialized :/";
    }

        var nDocs = req.body.nDocs;
        deleteAllContacts(function() {
            createContacts(nDocs, req.body.baseName, function() {
                msg = "generation done";
                res.send(200, req.body);
            });
        });

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
        
        var dataType = req.body.dataType;
        var getIdsMode;

        if(dataType === "contact"){
            getIdsContacts(function(ids) {
                //replicateRemote(ids, false, function(err) {
                 replicateDocs(ids, function(err) {
                    if(err)
                        res.send(500, {error: err});
                    else
                        res.send(200, req.body);
                });
            });
        }
        else if(dataType === "album"){
            sharePhotos(function(err) {
                if(err)
                    res.send(500, {error: err});
                else
                    res.send(200, req.body);
            });
        }
    }

    else if(req.params.bool === 'false') {

        cancelReplication(true, function(err) {
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
    var target = req.body.target;

    console.log('cozyUrl : ' + target);

    if(req.params.bool === 'true') {
        console.log('go register');

        var config;
        //paulsharing1 device : paul - kuzqgv069xz2gldie0yobrn18vbzkt9w
        if(target.indexOf("paulsharing1") > -1) {
            config = {
                cozyURL: target,
                login: "paul",
                password: "kuzqgv069xz2gldie0yobrn18vbzkt9w"
            };
        }
        //paulsharing2 device : test - hqthj9ggjnqoxbt9pl1sgja0mv5f80k9
        else if(target.indexOf("paulsharing2") > -1) {
            config = {
                cozyURL: target,
                login: "test",
                password: "hqthj9ggjnqoxbt9pl1sgja0mv5f80k9"
            };
        }
        else{
            var err = target + " not handled";
            console.log(err);
            res.send(500, {error: err});
        }


        console.log('replication ready !');
        Device = new Device({url: config.cozyURL, login: config.login, password: config.password });
        res.send(200, req.body);


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

var createContacts = function(nContacts, baseName, callback) {
    for(var i=0;i<nContacts;i++) {
        var firstName = baseName + "_" + i
        var lastName = ""
        var fullName = "";//"contact " + i;
        var n = lastName + ";" + firstName + ";;;"
        var datapoint = new Array();
        Contact.create({fn: fullName, n:n, datapoints: datapoint, note:''}, function(err, contact) {
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
                console.log("contact : " + contacts[i]);
                if(contacts[i].shared)
                    ids.push(contacts[i].id);
            }
            callback(ids);
        }
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
        doc_ids: ids
    };
    console.log("replication on ids " + ids);
	couchClient.post("_replicate", repSourceToTarget, function(err, res, body){
		if(err || !body.ok)
			handleError(err, body, "Backup source failed ");
		else{
			log.raw('Backup source suceeded \o/');
			log.raw(body);
            callback(err);
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

var cancelReplication = function(twoWays, callback) {
 
     var cancelCouchRep = function(client, ids, _callback) {
        for(var i=0;i<ids.length;i++) {

            client.post("_replicate", {replication_id: ids[i], cancel:true}, function(err, res, body){
                if(err || !body.ok){
                    console.log("Cancel replication failed");
                    callback(err);
                }
                else{
                    log.raw('Cancel replication ok');
                    _callback();
                }
            });
        }
     };

    getActiveTasks(couchClient, function(err, repIds) {
        if(err)
            callback(err);
        else if(repIds) {
            cancelCouchRep(couchClient, repIds, function(err) {
                //callback(err);
            });
        }
    });

  if(twoWays) {
        getActiveTasks(couchRemoteClient, function(err, repIds) {
            if(err)
                console.log(err);
            else if(repIds) {
                cancelCouchRep(couchRemoteClient, repIds, function(err) {
                    if(err)
                        console.log(err);
                    else{
                        callback();
                    }
                });
            }
        });
    }
};




var getActiveTasks = function(client, callback) {
    client.get("_active_tasks", function(err, res, body){
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
        callback(err, repIds);
        
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

var replicateRemote = function(ids, cancel, callback) {

    console.log("ids to replicate : " + ids);
    //var replicateRemoteURL = "https://toto:l9xvu7xpo1935wmidnoou9pvo893sorb@" + remoteConfig.cozyURL + "/cozy";
    var remoteURL = "https://" + Device.login + ":" + Device.password + "@" + Device.url + "/cozy";
    var localURL = "http://mondevicelocal:lsa9fix56uipy14ipf4n1yueut6jq0k9@localhost:9104/cozy";
    console.log(remoteURL);
    
var sourceToTarget = { 
        source: "cozy",
        target:  remoteURL, //"https://test:hqthj9ggjnqoxbt9pl1sgja0mv5f80k9@paulsharing2.cozycloud.cc/cozy/",
        continuous: true,
        doc_ids: ids,
        cancel: cancel
    };

    var targetToSource = {
        source: "http://xK6HiaweKzoF29VAmD39pgExldbPpc3d:x6O0bthwzDJlT91hyWZwJegM01NnQgtk@localhost:5984/cozy",
        target:  localURL, 
        continuous: true,
        doc_ids: ids
    };

    replicateWithProxy(sourceToTarget, "http://localhost:9104", "cozycloud", function(err) {
        if(err)
            console.log(err);
        else{
            replicateWithProxy(targetToSource, "https://paulsharing1.cozycloud.cc", "sharing1", function(err) {
                if(err) 
                    console.log(err);
                else
                    callback(err);
            });
        callback(err);
        }
    });
/*
    var req = request_new.defaults({jar: true});
    var localClient = req.post({url: "http://localhost:9104/login", qs: {username: "owner", password: "cozycloud"}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else {

            req.post({url: "http://localhost:9104/_replicate", json:true, body: sourceToTarget}, function(err, res, body) {
                if(res.statusCode == 302)
                    console.log("You are not authenticated");
                else if(err)  //|| (res.statusCode != 202))
                    console.log(err);
                else{
                    console.log("code : " + res.statusCode);
                    console.log("body : " + JSON.stringify(body));
                }
                callback(err);
            });

        }
    });

    var remoteClient = req.post({url: "https://paulsharing1.cozycloud.cc/login", qs: {username: "owner", password: "sharing1"}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else {

            req.post({url: "https://paulsharing1.cozycloud.cc/_replicate", json:true, body: targetToSource}, function(err, res, body) {
                if(res.statusCode == 302)
                    console.log("You are not authenticated"); 
                else if(err)  //|| (res.statusCode != 202))
                    console.log(err);
                else{
                    console.log("code : " + res.statusCode);
                    console.log("body : " + JSON.stringify(body));
                }
                callback(err);
            });

        }
    });*/
};

var replicateWithProxy = function(data, target, password, callback) {

    var req = request_new.defaults({jar: true});
    var loginURL = target + "/login";
    var replicateURL = target + "/_replicate";

    if(target.indexOf("paulsharing1") > -1)
        replicateURL = "https://xK6HiaweKzoF29VAmD39pgExldbPpc3d:x6O0bthwzDJlT91hyWZwJegM01NnQgtk@paulsharing1.cozycloud.cc/_replicate";

    var localClient = req.post({url: loginURL, qs: {username: "owner", password: password}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else {

            req.post({url: replicateURL, json:true, body: data}, function(err, res, body) {
                if(res.statusCode == 302)
                    console.log("You are not authenticated"); 
                else if(err)  //|| (res.statusCode != 202))
                    console.log(err);
                else{
                    console.log("code : " + res.statusCode);
                    console.log("body : " + JSON.stringify(body));
                }
                callback(err);
            });
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
};

var run_cmd = function(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
};

/*share an album  =>
    album id
        photo id
            raw id
            screen id
            thumb id
*/
var sharePhotos = function(callback) {

    var mapPhoto = function(photo) {
        if (photo.docType.toLowerCase() === "photo" )
            return emit(photo.albumid, photo);
    };

    var ids = [];


    // Retrieving all photos
    Album.request("all", function (err, albums) {
        async.each(albums, function(album, callback) {
            console.log("album : " + album.title);
            ids.push(album.id);
            Photo.defineRequest("byalbumid", mapPhoto, function(err) {
                if(err)
                    callback(err);
                else{
                    Photo.request("byalbumid", {key: "664d5dfb37850e4721c92cdcb50018f5"}, function(err, photos) {
                        if(err)
                            callback(err);
                        else{
                            async.each(photos, function(photo, callback) {
                                ids.push(photo.id);
                                ids.push(photo.binary["raw"]["id"]);
                                ids.push(photo.binary["screen"]["id"]);
                                ids.push(photo.binary["thumb"]["id"]);
                                callback();
                            }, function(err) {
                                if(err)
                                    console.log(err);
                                else{
                                    console.log('ids : ' + ids);
                                    replicateRemote(ids, false, function(err) {
                                        if(err)
                                            console.log(err);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }, function(err){
            if(err)
                console.log(err);
        });
    });


};





