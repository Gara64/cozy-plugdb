var java = require("java");
var jdbcJar = './plug/plug_api.jar';
java.classpath.push(jdbcJar);
var plug = java.newInstanceSync('org.cozy.plugtest.Plug');

var close = function(callback){
    console.log("Closing plugDB connexion...");
	plug.plugClose( function(err, result) {
		if(err) {  callback(err); }
		else{
	        callback();
        }
    });
};

var select = function(){
	plug.plugSelect( function(err, result) {
		if(err) { console.error(err); return; }
		else{
			//close();
			console.log("read ok");
		}
	});
};


function insertPlug(ids, callback){

	plug.plugInsert(ids, function(err, result){
		if(err) { console.error(err); return; }
		else{
			callback();
			console.log("insert ok");
		}
	});
};


var convert = function(ids, insertPlug, callback){
console.log("go convert");
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

var init = function (callback){
	plug.plugInit('/dev/ttyACM0', function(err, result) {
		if(err) { callback(err);  }
		else {
			//getIds();
			callback();
		}
	});
    
};


exports.init = init;
exports.insert = insert;
exports.convert = convert;
exports.insertPlug = insertPlug;
exports.select = select;
exports.close = close;
