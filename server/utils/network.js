var checkCredentials = function(config, callback) {
    var remoteProxyClient = request.newClient("https://" + config.cozyURL);
    return remoteProxyClient.post("login", {
        username: 'owner',
        password: config.password
      }
    , function(err, response, body) {
      var error;
      if ((response != null ? response.statusCode : void 0) !== 200) {
        error = (err != null ? err.message : void 0) || body.error || body.message;
      } else {
        error = null;
      }
      return callback(error);
    });
};

var testRemotePlug = function(callback) {

    var req = request_new.defaults({jar: true});
    var remoteClient = req.post({url: "https://paulsharing1.cozycloud.cc/login", qs: {username: "owner", password: "sharing1"}}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        else{
            req.post({url: "https://paulsharing1.cozycloud.cc/apps/plug/init"}, function(err, res, body) {
                if(err)
                    return console.error(err);
                else{
                    console.log("code : " + res.statusCode);
                    console.log("body : " + JSON.stringify(body));
                }
            });
        }
    });
};