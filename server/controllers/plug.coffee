plug = require '../lib/plug.js' ;
log = require 'printit'   ;
Contact = require '../models/contacts.js' ;
request = require 'request-json-light' ;
basic = require '../lib/basic.js' ;

remoteConfig: ->
    cozyURL: "192.168.50.5",
    password: "cozycloud"


couchUrl = "http://192.168.50.4:5984/";
couchClient = request.newClient(couchUrl);

couchUrlRemote = "http://pzjWbznBQPtfJ0es6cvHQKX0cGVqNfHW:NPjnFATLxdvzLxsFh9wzyqSYx4CjG30U@192.168.50.5:5984/";
remoteProxyClient = request.newClient("https://" + remoteConfig.cozyURL);
replicateRemoteURL = "https://toto:l9xvu7xpo1935wmidnoou9pvo893sorb@" + remoteConfig.cozyURL + "/cozy"; #this should be built dynamically by the device creation

module.exports.main: (req, res) -> 


    getIdsContacts(ids) => 
    	replicateRemote( ids, remoteConfig, (err) =>
    		if err
    			console.log("fail");
            else
                console.log("success, gg");


    res.render 'index.jade', (err, html) => 
        res.send 200, html;
};





