var java = require("java");
var jdbcJar = 'plug_api.jar';
java.classpath.push(jdbcJar);
var plug = java.newInstanceSync('org.cozy.plugtest.Plug');

var close = function(){
	plug.plugClose( function(err, result) {
		if(err) { console.error(err); return; }
		else
			console.log("closed");
	});
};

var read = function(){
	plug.plugSelect( function(err, result) {
		if(err) { console.error(err); return; }
		else{
			close();
			console.log("read ok");
		}
	});
};

var insert= function(list){
	plug.plugInsert(list, function(err, result){
		if(err) { console.error(err); return; }
		else{
			read();
			console.log("insert ok");
		}
	});
};

var getIds = function(){
	plug.couchDocs( function(err, result) {
		if(err) { console.error(err); return; }
		else
			insert(result);
		});
	};

var init = function (){
	plug.plugInit('/dev/ttyACM3', function(err, result) {
		if(err) { console.error(err); return; }
		else {
			getIds();
			console.log('init ok');
		}
	});
};

init();




