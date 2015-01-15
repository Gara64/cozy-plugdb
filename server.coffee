express = require('express')
http = require('http')
request = require('request-json-light')
plug = require('./lib/plug.js')
log = require('printit')()
Schema = require('jugglingdb').Schema;

db = new Schema('cozy-adapter', { url: 'http://localhost:9101/' });
app = express();
couchUrl = "http://127.0.0.1:5985/";
couchClient = request.newClient(couchUrl);

#This will allow Cozy to run your app smoothly but
# it won't break other execution environment 
port = process.env.PORT || 9250;
host = process.env.HOST || "127.0.0.1";

File = db.define('File', {
  "id": String,
  "content": { "type": String, "default": ""}
});

#Starts the server itself
server = http.createServer(app).listen(port, host, function() {
  	console.log("Server listening to %s:%d within %s environment",
              host, port, app.get('env'));

  	var target = "http://192.168.0.20:5984/cozy_backup";

	plug.init(function(){
		#deleteAllFiles();
		createFiles(2);
		getFiles(insertFiles, target);
	});
	

});