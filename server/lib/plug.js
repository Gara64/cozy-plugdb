var java = require("java");
var async = require('async');
var jdbcJar = './plug/plug_api.jar';
java.classpath.push(jdbcJar);
var plug = java.newInstanceSync('org.cozy.plug.Plug');



// Create a queue object with concurrency 1
// This is mandatory to deal correctly with PlugDB
q = async.queue(function(task, callback) {
    p = task.params
    //console.log 'params : ' + JSON.stringify p

    if(p[0] === 0) {
		plug.plugInit(p[1], function(err, res) {
        	callback(err, res);
		});
	}
	else if(p[0] === 1) {
		plug.plugFPAuthentication(function(err, res) {
        	callback(err, res);
		});
	}
    else if(p[0] === 2) {
		plug.plugInsert(p[1], function(err, res) {
        	callback(err, res);
		});
	}
	else if(p[0] === 3) {
		plug.plugSelectDocs(function(err, res) {
        	callback(err, res);
		});
	}
	else if(p[0] === 4) {
		plug.plugClose(function(err, res) {
        	callback(err, res);
		});
	}
    else
        callback();
}, 1);



//initialize PlugDB
var init = function (callback){

	task = {params: [0, '/dev/ttyACM0']};

	q.push(task, function(err, status) {
		if(err)
			callback(err);
		else {
			console.log("PlugDB is ready");
			callback();
		}
	});
};

//Authenticate by fingerprint
var authFP = function(callback){
	task = {params: [1]};
	q.push(task, function(err, res) {
		callback(err, res);
	});
};

//insert docids and associated rules
var insert = function(ids, callback){
	//The js Object needs to be converted into a java String array
	var array = java.newArray("java.lang.String", ids);
	task = {params: [2, array]};
	q.push(task, function(err, res) {
		console.log(res + ' docs inserted');
		callback(err);

	});
};

//select start on docs to return the ids
var select = function(callback){

	task = {params: [3]};
	q.push(task, function(err, res) {
		callback(err, res);
	});
};

//close the connection and save the data on flash
var close = function(callback){
	task = {params: [4]};
	q.push(task, function(err, res) {
		callback(err, res);
	});
};




exports.init = init;
exports.insert = insert;
exports.select = select;
exports.close = close;
exports.authFP = authFP;
