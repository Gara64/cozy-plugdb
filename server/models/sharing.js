var request = require('request-json');

/*module.exports = Sharing = {
	couchClient: initClient("http://localhost:5985"),
	targetURL: "", 
	couchTarget: ""
};*/

module.exports.initClient = function(couchUrl) {
	return request.newClient(couchUrl);
};

module.exports.targetURL = "";




