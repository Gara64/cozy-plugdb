var async = require('async');
var log = require('printit')();
var plug = require('../lib/plug.js');
Device = require('../models/device.js');
Contact = require('../models/contacts');
cozydb = require('cozydb');


//var request = require('request-json-light');
var request = require('request-json');
var request_new = require('request');
var basic = require('../lib/basic.js');
var plugInit = false; //used to test plugDB connection
var plugAuth = false; //used to check if authenticated

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


module.exports.init = function(req, res) {
    initPlug(req, res);
};

var initPlug = function(req, res, callback) {
    var msg;
    if(plugInit) {
        msg = 'PlugDb already initialized';
        console.log(msg);
        res.send(200, msg);
    }
    else {
        plug.init( function(err) {
            if(callback)
                callback(err);
            else if(err) {
                console.log(err);
                msg = "Init failed";
                res.send(500, {error: msg});
            }
            else{
                plugInit = true;
                msg = "Init succeeded";
                console.log(msg);
                res.send(200, msg);
            }
        });
    }
};

module.exports.close = function(req, res) {
    closePlug(req, res);
};

var closePlug = function(req, res, callback) {
    var msg; 
    if(!plugInit){
        msg = "PlugDB is not initialized";
        res.send(200, msg);
    }
    else {
        plug.close( function(err) {
            if(callback)
                callback(err);
            else if(err) {
                msg = "Shutdown failed";
                res.send(500, {error: msg});
            }
            else {
                plugInit = false;
                plugAuth = false;
                msg = "Closed correctly";
                res.send(200, msg);
            }
        });
    }
};


module.exports.reset = function(req, res) {
    var msg;
    var init = function(req, res) {
        initPlug(req, res, function(err) {
            if(err) {
                msg = "Init failed";
                res.send(500, {error: msg});
            }
            else {
                plugInit = true;
                plugAuth = false;
                msg = "Reset ok";
                res.send(200, msg);
            }
        });
    };

    if(plugInit) {
        closePlug(req, res, function(err) {
            if(err) {
                msg = "Reset failed";
                res.send(500, {error: msg});
            }
            else {
                plugInit = false;
                plugAuth = false;
                init(req, res);
            }
        });
    }
    else 
        init(req, res);
    
};

module.exports.insert = function(req, res) {
    var msg;
    if(!plugInit){
        console.log("PlugDB not initialized");
        msg = "PlugDB not initialized :/";
        res.send(500, {error: msg});
    }
    else {
        var nDocs = req.body.nDocs;

        //synchronous execution, to pass an array to the plugdb insert function
        async.waterfall([
            function(callback) {
                deleteAllContacts(function() {
                    callback();
                });
            },
            function(callback) {
                createContacts(nDocs, req.body.baseName, function(ids) {
                    callback(null, ids);
                });
            },
            function(ids, callback) {
                plug.insert(ids, function(err) {
                    if(err) {
                        console.log(err);
                        msg = "Insertion failed";
                        res.send(500, {error: msg});
                    }
                    else {
                        msg = nDocs + " docs generated and ids inserted in PlugDB";
                        res.send(200, msg);
                    }
                });
            }
        ]);
    }
};


module.exports.replicate = function(req, res) {

    var msg;
    if(!plugInit){
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
    if(!plugInit){
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

};

module.exports.authFP = function(req, res) {

     if(!plugInit){
        initPlug(req, res, function(err) {
            if(err)
                res.send(500, {error: err}); //TODO ; handle init with auth failed
            else {
                plugInit = true;
                plug.authFP(function(err, authID) {
                    auth(err, res, authID);
                });
            }
        });
     }
     else {
        plug.authFP(function(err, authID) {
             auth(err, res, authID);
        });
     }
};

var auth = function(err, res, authID) {
    if(err || authID === undefined || authID < 0) {
        console.log("err : " + err + " - authID : " + authID);
        msg = "Authentication failed";
        plugAuth = false;
        res.send(500, {error: msg});
    }
    else {
        console.log("authID : " + authID);
        plugInit = true;
        plugAuth = true;
        msg = "Authentication succeeded";
        res.send(200, msg);
    }
};


module.exports.status = function(req, res) {
    var status = {
        init: plugInit,
        auth: plugAuth
    };
    res.send(200, status);
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



var deleteAllContacts = function(callback) {
    Contact.requestDestroy("all", function(err) {
        if(err)
            log.raw(err);
        else
            log.raw("all notes deleted");
        callback();
    });
};

var createContacts = function(nDocs, baseName, callback) {
    var ids = [];
    var cpt = 0;
    for(var i=0; i<nDocs; i++) {
        createCozyContact(baseName, function(id) {
            ids.push(id);
            cpt++;
            console.log('id' + id + ' in array - cpt = ' + cpt + ' (ndocs = ' + nDocs);
            if(cpt == nDocs ){
                console.log('done');
                callback(ids);
            }
        });
    }
};

var createCozyContact = function(baseName, callback) {
    var datapoint = new Array();
    Contact.create({fn: baseName, datapoints: datapoint }, function(err, contact) {
        if(err)
            console.error(err);

        else{
            log.raw('contact created : ' + contact.id);
            callback(contact.id);
        }
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

var uploadFiles = function(file, callback) {
    var req = request_new.defaults({jar: true});
    var remoteClient = req.post({url: "https://paulsharing2.cozycloud.cc/login", qs: {username: "owner", password: "sharing2"}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else {
           // var data 
            req.post({url: "https://paulsharing2.cozycloud.cc/apps/files/files", body: file}, function(err, res, body) {
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





