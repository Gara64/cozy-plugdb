var plug = require('../lib/plug.js');
var async = require('async');
var log = require('printit')();
File = require('../models/files.js');
Note = require('../models/notes.js');
var request = require('request-json-light');
//var couchClient = require('

var init = false; //used to test plugDB connection

var couchUrl = "http://192.168.50.4:5984/";
var couchUrlTarget = "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/";

module.exports.main = function (req, res) {

    
    res.render('index.jade'), function(err, html) {
        res.send(200, html);
};
    /*plug.init(function(){
		deleteAllFiles(createNotes, 2);
		getNotes(insertPlug, target);
	});*/
    
    
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
        //res.send(200, msg);
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
    else {

    var nNotes = req.body.nDocs;
    console.log("n notes : " + nNotes);
    deleteAllNotes(function() {
        createNotes(nNotes, function() {
            insertPlug( function(ids) {
                console.log("insert " + nNotes + " done : " + ids);
                msg = "insert done";
            });
        });
    });
    }
    res.render('index.jade', {status:msg}, function(err, html){
                    res.send(200, html);
    });

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
    if (repMode != "noplug") 
        getIdsMode = selectPlug;
    else
        getIdsMode = getIdsNotes; 

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

var insertPlug = function(callback) {
    getIdsNotes(function(ids) {
        console.log("insert in plug: " + ids);
	    plug.insert(ids, function(){
		    callback(ids);
	    });
    });
};

var selectPlug = function( callback) {
	    plug.select( function(ids){
		    console.log(ids);
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

var replicateDocs = function(ids, callback) {

    var couchClient = request.newClient(couchUrl);
	var repSourceToTarget = { 
		source: "cozy", 
		target: "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/cozy",
        continuous: true,
        cancel: true,
        doc_ids: ids
        
    };
    var couchTarget = request.newClient(couchUrlTarget);
	var repTargetToSource = { 
		source: "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/cozy", 
		target: "http://192.168.50.4:5984/cozy",
        continuous: true,
        cancel: true,
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

var generateKey = function(){
	return crypto.randomBytes(256, function(ex, buf) {
  		if (ex) throw ex;
  		return buf;
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



