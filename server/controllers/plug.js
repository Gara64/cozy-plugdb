var async = require('async');
var plug = require('../lib/plug.js');
var basic = require('../lib/basic.js');
Contact = require('../models/contacts');


plugInit = false; //used to test plugDB connection
plugAuth = false; //used to check if authenticated


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
        plugInit = false; //immediatly set at false to avoid request during the shutdown
        plug.close( function(err) {
            if(callback)
                callback(err);
            else if(err) {
                msg = "Shutdown failed";
                plugInit = true;
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
                plugInit = true;
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

module.exports.generate = function(req, res) {
    var msg;
    if(!plugInit){
        console.log("PlugDB not initialized");
        msg = "PlugDB not initialized :/";
        res.send(500, {error: msg});
    }
    else if(!plugAuth) {
        msg = "Not authenticated";
        res.send(500, {error: msg});
    }
    else {
        var nDocs = req.body.nDocs;

        //synchronous execution, to pass an array to the plugdb insert function
        async.waterfall([
            function(callback) {
                Contact.deleteAll(function(err) {
                    callback();
                });
            },
            function(callback) {
                async.times(nDocs, function(i, cb) {
                    Contact.createSingleContact(req.body.baseName, function(err, id) {
                        cb(err, id);
                    });
                }, function(err, ids) {
                    console.log('ids ' + JSON.stringify(ids));
                    callback(err, ids);
                });
            },
            function(ids, callback) {
                console.log('lets insert ids ' + JSON.stringify(ids));
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

module.exports.insert = function(req, res) {
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
        var baseName = req.body.baseName;
        Contact.createSingleContact(baseName, function(err, id) {
            //avoid conflict with the select triggered by socket.io
            setTimeout(function() {
                plug.insert(id.split(), function(err) {
                    if(err) {
                        console.log(err);
                        msg = "Insertion failed";
                        res.send(500, {error: msg});
                    }
                    else {
                        msg = baseName + ' has been added and the id inserted in PlugDB';
                        res.send(200, msg);
                    }
                });
            }, 2000);
        });
    }
};

module.exports.select = function(req, res) {
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
        plug.select( function(err, ids) {
            if(err){
                msg = "Selection failed";
                res.send(500, {error: msg});
            }
            else {
                console.log("ids : " + ids);
                res.send(200, ids.toString());
            }
        });
    }
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



//get the ids present in contacts and plug
module.exports.filterContactsPlug = function(contacts, callback) {
    if(!plugInit) {
        callback("plugdb not initialized");
    }
    else {
        var filteredContacts = [];
        var idsToInsert = [];

        //add delay if case a plugdb query is running
        //setTimeout(function() {

        plug.select(function(err, idsPlug) {
            if(err){
                callback(err);
            }
            else {
                console.log('select plug : ' + JSON.stringify(idsPlug));

                for(var i=0;i<contacts.length;i++) {

                    if(idsPlug != null && idsPlug.indexOf(contacts[i].id) > -1 ) {
                        console.log(contacts[i].id + " match");
                        filteredContacts.push(contacts[i]);
                    }
                    else {
                        console.log(contacts[i].id + " does not match");
                        if(contacts[i].shared) {
                            console.log(contacts[i].id + ' is a shared contact, insert the id');
                            idsToInsert.push(contacts[i].id);
                        }
                    }
                }

                //in case we received shared contacts, insert the ids
                if(idsToInsert!= null) {
                    plug.insert(idsToInsert, function(err) {
                        callback(err, filteredContacts);
                    });
                }
                else
                    callback(err, filteredContacts);
            }
        });
    //}, 1000);
    }
};


var sharePhotos = function(callback) {

    // Retrieving all photos
    Album.request("all", function (err, albums) {

        for(var i=0; i<albums.length;i++){
            console.log("album : " + albums[i].title);

        }
     });

};
