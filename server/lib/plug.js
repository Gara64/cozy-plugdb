var java = require("java");
var jdbcJar = './plug/plug_api.jar';
java.classpath.push(jdbcJar);
var plug = java.newInstanceSync('org.cozy.plug.Plug');

//initialize PlugDB
var init = function (callback){
	plug.plugInit('/dev/ttyACM0', function(err) {
		callback(err);
	});
};

//insert docids and associated rules
var insert = function(ids, callback){
	//The js Object needs to be converted into a java String array
	var array = java.newArray("java.lang.String", ids);
	plug.plugInsert(array, function(err) {
		callback(err);
	});
};

//select start on docs to return the ids
var select = function(callback){
	plug.plugSelect(function(err, result) {
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



/*
REMOVE IT?
function insertPlug(ids, callback){

	plug.plugInsert(ids, function(err, result){
		if(err) { console.error(err); return; }
		else{
			callback();
		}
	});
};


var convert = function(ids, insertPlug, callback){
	var ArrayList = java.import('java.util.ArrayList');
	var list = new ArrayList();
	for(var i=0;i<ids.length;i++)
		list.add(ids[i]);
	insertPlug(list, callback);
}

var insert = function(ids, callback){
	convert(ids, insertPlug, callback);
}

var getIds = function(){
	plug.couchDocs( function(err, result) {
		if(err) { console.error(err); return; }
		else
			insertPlug(result);
		});
	};
*/



exports.init = init;
exports.insert = insert;
exports.select = select;
exports.close = close;
exports.authFP = authFP;
