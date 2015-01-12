// Generate a new instance of express server.
var express = require('express')
  , http = require('http')
  , Client = require('request-json').JsonClient
  , plug = require('./lib/plug.js');

var app = express();

// The data system listens to localhost:9101
dataSystem = new Client('http://localhost:9101');

// In production we must authentificate the application
/*if(process.env.NODE_ENV === 'production') {
  user = process.env.NAME;
  password = process.env.TOKEN;
  dataSystem.setBasicAuth(user, password);
}*/




/* This will allow Cozy to run your app smoothly but
 it won't break other execution environment */
var port = process.env.PORT || 9250;
var host = process.env.HOST || "127.0.0.1";

// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
  console.log("Server listening to %s:%d within %s environment",
              host, port, app.get('env'));
});

// At the root of your website, we show the index.html page
app.get('/', function(req, res) {
  res.sendfile('./public/index.html')
  //plug.start();
});

var data = {'test' : 'testy'} ;

// The request must be created first, let's say it is
var post = function() {
	dataSystem.post('data/', data, function(err, res, body) {
	  if(err !== null || (res !== null && res.statusCode != 201)) {
	    if(res !== null) 
	    	code = res.statusCode; 
	    else 
	    	code = "no status code";
	    console.log("An error occurred -- [" + code + "] " + err);
	  }
	  else {
	    console.log("created doc : ");
	    console.log(body);
	  }
	});
}

