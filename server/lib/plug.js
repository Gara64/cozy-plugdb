var java = require("java");
var jdbcJar = './plug/plug_api.jar';
java.classpath.push(jdbcJar);
var plug = java.newInstanceSync('org.cozy.plug.Plug');

//initialize PlugDB
var init = function (callback){

	// Setup the timeout handler
	var timeoutProtect = setTimeout(function() {
	  timeoutProtect = null;
	  callback({error:'PlugDB timed out'});
	}, 20000);

	plug.plugInit('/dev/ttyACM0', function(err) {
		  if (timeoutProtect) {
		    clearTimeout(timeoutProtect);
		    callback(err);
		  }
	});
};

//insert docids and associated rules
var insert = function(ids, callback){
	//The js Object needs to be converted into a java String array
	var array = java.newArray("java.lang.String", ids);
	plug.plugInsert(array, function(err, res) {
		console.log(res + ' docs inserted');
		callback(err);
	});
};

//select start on docs to return the ids
var select = function(callback){
	plug.plugSelectDocs(function(err, result) {
		callback(err, result);
	});
};

//close the connection and save the data on flash
var close = function(callback){
	plug.plugClose(function(err) {
		callback(err);
	});
};

//Authenticate by fingerprint
var authFP = function(callback){
	plug.plugFPAuthentication(function(err, authID) {
		callback(err, authID);
	});
};


exports.init = init;
exports.insert = insert;
exports.select = select;
exports.close = close;
exports.authFP = authFP;
