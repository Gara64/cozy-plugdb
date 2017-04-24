Contact = require('../models/contacts');
var request_new = require('request');
var async = require('async');
var request = require('request-json');
var log = require('printit')();
Sharing = require('../models/sharing');

SOURCE = "http://192.168.0.1";
TARGET = "http://192.168.0.2";

var couchClient = Sharing.initClient(SOURCE + ":5984");
var couchTarget = request.newClient(TARGET + ":5984");

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
    else {

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

    }


};

/* !!! DEPRECATED (PASS THROUGH 5984 PORT) !!!
See replicateRemote instead */
var replicateDocs = function(target, ids, callback) {


    var source = SOURCE + ":5984/cozy";
    Sharing.targetURL = "http://" + target + ":5984";

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
            log.raw(err);
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
                    log.raw(err);
                    log.raw(body);
                    console.log("Replication from target failed");
                    callback("Replication from target failed");

                }
                else{
                    log.raw('Replication from target suceeded \o/');
                    log.raw(body);
                    callback();
                }
            });
        }
    });


};

var cancelReplication = function(callback) {

    stopReplications(couchClient, function(err) {
        if(err)
            callback(err);
        else {
            stopReplications(couchTarget, function(err) {
                callback(err);
            });
        }
    });
}



 var stopReplications = function(client, callback) {

     getActiveTasks(client, function(err, tasks) {
         console.log('tasks : ' + JSON.stringify(tasks));

         if(err)
             callback(err);
         else if(!tasks || tasks.length === 0){
             callback();
         }
         else {

             async.each(tasks, function (task, cb) {
                 options = {
                     replication_id:  task.replication_id,
                     cancel:true
                 };

                 client.post("_replicate", options, function(err, res, body){
                     if(err || !body.ok){
                         console.log("Cancel replication failed");
                         cb(err);
                     }
                     else {
                         log.raw('Cancel replication ok');
                         cb();
                     }
                 });
             }, function(err) {
                 callback(err);
             });
         }

     });
 }


var getActiveTasks = function(client, callback) {
    client.get("_active_tasks", function(err, res, body){
        callback(err, body);

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
