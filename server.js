// Generate a new instance of express server.
var express = require('express')
  , http = require('http')
  , request = require('request-json-light')
  , plug = require('./lib/plug.js')
  , log = require('printit')()
  , Schema = require('jugglingdb').Schema
  , crypto = require('crypto');

var db = new Schema('cozy-adapter', { url: 'http://localhost:9101/' });
var app = express();
var couchUrl = "http://127.0.0.1:5985/";
var couchClient = request.newClient(couchUrl);


// The data system listens to localhost:9101
//dataSystem = new Client('http://localhost:9101');


// In production we must authentificate the application
/*if(process.env.NODE_ENV === 'production') {
  user = process.env.NAME;
  password = process.env.TOKEN;
  dataSystem.setBasicAuth(user, password);
}*/








/*
// The request must be created first, let's say it is
var generateDocs = function(nDocs) {

	for(var i=0;i<nDocs;i++)
	{
		//var doc = "doc " + i;
		var data = {
			"docType" : "file",
			"doc" : "testy"
		};
		post(data);
	}
}

var post = function(data) {
	dataSystem.post('data/', data, function(err, res, body) {
	  if(err !== null || (res !== null && res.statusCode != 201)) {
	    if(res !== null) 
	    	code = res.statusCode; 
	    else 
	    	code = "no status code";
	    log.raw("An error occurred -- [" + code + "] " + err);
	  }
	  else {
	    log.raw("created doc : ");
	    log.raw(body);
	  }
	});
};

var listDocs = function() {
	dataSystem.post('/request/file/all/', {}, function(err, res, body) {
	  if(err !== null || (res !== null && res.statusCode != 200)) {
	    if(res !== null) {code = res.statusCode;} else { code = "no status code"; }
	    log.raw("An error occurred -- [" + code + "] " + err);
	  }
	  else {
	    log.raw("List of all the files");
	    var ids = [];
	    for(var i=0;i<body.length;i++){
	    	ids.push(body[i].id);
	    	log.raw("id : " + ids[i]);
	    }
	    return ids;
	  }
	});
};

var deleteDoc = function(id) {
	dataSystem.delete('/data/' + id, function(err, res, body) {
	  if(err !== null || (res !== null && res.statusCode != 204)) {
	    if(res !== null) {code = res.statusCode;} else { code = "no status code"; }
	    log.raw("An error occurred -- [" + code + "] " + err);
	  }
	  else {
	 	log.raw("doc with id " + id);
	  }
	});
};
*/

File = db.define('File', {
  "id": String,
  "name": String,
  "content": { "type": String, "default": ""}
});

Note = db.define('Note', {
  "id": String,
  "title": String,
  "parent_id" :String,
  "path": String,
  "version": Number,
  "content": { "type": String, "default": ""}
});

/* This will allow Cozy to run your app smoothly but
 it won't break other execution environment */
var port = process.env.PORT || 9250;
var host = process.env.HOST || "127.0.0.1";

// Starts the server itself
var server = http.createServer(app).listen(port, function (err) {
  if (err)
    throw err; // For completeness's sake.
  



  	//log.raw("Server listening to %s:%d within %s environment",
      //        host, port, app.get('env'));


  	/*var target = "http://192.168.0.20:5984/cozy_backup";

	plug.init(function(){
		deleteAllFiles(createNotes, 2);
		getNotes(insertFiles, target);
	});*/
	

});

// At the root of your website, we show the index.html page
app.get('/', function(req, res) {
  res.sendfile('./public/index.html');
  
  //plug.start();
});


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

var createNotes = function(nNotes) {
	for(var i=0;i<nNotes;i++){
		var noteName = "gen_note " + i;
		Note.create({"title":noteName, "parent_id":"tree-node-all", "path":noteName, "version":1, "content":"coucou"}, function(err, note) {
			if(err)
	    		console.error(err);
	    	else
	    		log.raw('note created : ' + note.id);
		});
	}
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

var getNotes = function(callback, target) {
	// Getting request results
	Note.request("all", function (err, files) {
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

var insertFiles = function(ids) {
	log.raw(ids);
	plug.insert(ids, function(){
		replicateDocs(ids);
		plug.close();
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

var replicateDocs = function(ids, target) {
	var data = { 
		source: "cozy", 
		target: "http://192.168.0.20:5984/cozy_backup",
		doc_ids: ids 
	};
	return couchClient.post("_replicate", data, function(err, res, body){
		if(err || !body.ok)
			return handleError(err, body, "Backup failed ");
		else{
			log.raw('Backup suceeded \o/');
			log.raw(body);
			return process.exit(1);
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
