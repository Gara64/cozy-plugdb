Contact = require('../models/contacts');
Device = require('../models/device.js');
var request_new = require('request');
var async = require('async');
var request = require('request-json');
var log = require('printit')();
Sharing = require('../models/sharing');

SOURCE = "http://192.168.90.209"

var couchClient = Sharing.initClient(SOURCE + ":5984");
var couchTarget;

module.exports.replicate = function(req, res) {

    var msg;
    if(!plugInit){
        msg = "PlugDB not initialized :/";
        res.send(500, {error: msg});
    }
    else if(!plugAuth) {
        msg = "Not authenticated";
        res.send(500, {error: msg});
    }

    console.log(req.params.bool);

    //create replication request
    if(req.params.bool === 'true'){

        var dataType = req.body.dataType;
        var target = req.body.target;
        var getIdsMode;

        if(dataType === "contact"){
            Contact.getSharedContacts(function(err, docs) {
                if(err)
                    res.send(500, {error: err});
                else {
                    //replicateRemote(ids, false, function(err) {
                     replicateDocs(target, docs, function(err) {
                        if(err)
                            res.send(500, {error: err});
                        else
                            res.send(200, req.body);
                    });
                }
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

    //cancel replication request
    else if(req.params.bool === 'false') {

        cancelReplication(function(err) {
            if(err)
                res.send(500, {error: err});
            else
                res.send(200, "Replication successfully cancelled");
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
        //paulSharing.1 device : paul - kuzqgv069xz2gldie0yobrn18vbzkt9w
        if(target.indexOf("paulSharing.1") > -1) {
            config = {
                cozyURL: target,
                login: "paul",
                password: "kuzqgv069xz2gldie0yobrn18vbzkt9w"
            };
        }
        //paulSharing.2 device : test - hqthj9ggjnqoxbt9pl1sgja0mv5f80k9
        else if(target.indexOf("paulSharing.2") > -1) {
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


/* !!! DEPRECATED (PASS THROUGH 5984 PORT) !!!
See replicateRemote instead */
var replicateDocs = function(target, ids, callback) {

    var source;
    if(target === "192.168.50.5") {
        source = "http://192.168.50.4:5984/cozy";
        Sharing.targetURL = "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/cozy";
    }
    else if(target === "192.168.0.1") {
        source = "http://192.168.0.2:5985/cozy";
        Sharing.targetURL = "http://192.168.0.1:5985/cozy";
    }
    else if(target === "192.168.0.2") {
        source = "http://192.168.0.1:5985/cozy";
        Sharing.targetURL = "http://" + target + ":5985/cozy";
    }
    else {
        source = SOURCE + ":5984/cozy";
        Sharing.targetURL = "http://" + target + ":5984";
    }


    var repSourceToTarget = {
        source: "cozy",
        target: Sharing.targetURL + "/cozy",
        continuous: true,
        //cancel: true,
        doc_ids: ids
    };
    couchTarget = Sharing.initClient(Sharing.targetURL);

    var repTargetToSource = {
        source: "cozy",
        target: source,
        continuous: true,
        doc_ids: ids
    };
    console.log("replication on ids " + ids + " to " + repSourceToTarget.target);

    couchClient.post("_replicate", repSourceToTarget, function(err, res, body){
        //err is sometimes empty, even if it has failed
        if(err || !body.ok){
            log.raw(body);
            console.log("Replication from source failed");
            callback("Replication from source failed");
        }
        else{
            log.raw('Replication from source suceeded \o/');
            log.raw(body);

            console.log("replication target :  "  + JSON.stringify(repTargetToSource));

            couchTarget.post("_replicate", repTargetToSource, function(err, res, body){
                if(err || !body.ok){
                    log.raw(body);
                    console.log("Replication from target failed");
                    callback("Replication from target failed");

                }
                else{
                    log.raw('Replication from target suceeded \o/');
                    log.raw(body);
                    callback(err);
                }
            });
        }
    });


};

var cancelReplication = function(callback) {

     var cancelCouchRep = function(tasks, cb) {

        async.each(tasks, function (task, _cb) {
            options = {
                replication_id:  task.replication_id,
                cancel:true
            };

            client.post("_replicate", options, function(err, res, body){
                if(err || !body.ok){
                    console.log("Cancel replication failed");
                    _cb(err);
                }
                else{
                    log.raw('Cancel replication ok');
                    _cb();
                }
            });
        }, function(err) {
            cb(err);
        });

     };

     //get local active tasks
    getActiveTasks(couchClient, function(err, tasks) {
        if(err)
            callback(err);
        else {
            cancelCouchRep(tasks, function(err) {
                callback(err);
            });
        }
    });

    /*
    if(couchTarget != null) {
        getActiveTasks(couchTarget, function(err, repIds) {
            if(err)
                callback(err);
            else if(repIds) {
                cancelCouchRep(couchTarget, repIds, function(err) {
                    callback(err);
                });
            }
        });
    }
    else {
        callback(null);
    }
    */

};




var getActiveTasks = function(client, callback) {
    client.get("_active_tasks", function(err, res, body){
        callback(err, body);

    });
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
        target:  remoteURL, //"https://test:hqthj9ggjnqoxbt9pl1sgja0mv5f80k9@paulSharing.2.cozycloud.cc/cozy/",
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
            replicateWithProxy(targetToSource, "https://paulSharing.1.cozycloud.cc", "Sharing.1", function(err) {
                if(err)
                    console.log(err);
                else
                    callback(err);
            });
        callback(err);
        }
    });
};

var replicateWithProxy = function(data, target, password, callback) {

    var req = request_new.defaults({jar: true});
    var loginURL = target + "/login";
    var replicateURL = target + "/_replicate";

    if(target.indexOf("paulSharing.1") > -1)
        replicateURL = "https://xK6HiaweKzoF29VAmD39pgExldbPpc3d:x6O0bthwzDJlT91hyWZwJegM01NnQgtk@paulSharing.1.cozycloud.cc/_replicate";

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
    var remoteClient = req.post({url: "https://paulSharing.2.cozycloud.cc/login", qs: {username: "owner", password: "Sharing.2"}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else {
           // var data
            req.post({url: "https://paulSharing.2.cozycloud.cc/apps/files/files", body: file}, function(err, res, body) {
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
